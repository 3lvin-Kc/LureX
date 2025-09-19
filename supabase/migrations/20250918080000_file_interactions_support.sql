-- Add file interaction support to campaigns and metrics

-- Add file simulation fields to campaigns table
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS simulation_type VARCHAR(10) DEFAULT 'link' CHECK (simulation_type IN ('link', 'file')),
ADD COLUMN IF NOT EXISTS file_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);

-- Add file interaction tracking fields to campaign_metrics table
ALTER TABLE campaign_metrics 
ADD COLUMN IF NOT EXISTS file_downloaded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS file_opened_at TIMESTAMPTZ;

-- Create file_interactions table for detailed file interaction logging
CREATE TABLE IF NOT EXISTS file_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    target_email VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('download_attempt', 'file_open_attempt')),
    user_agent TEXT,
    ip_address INET,
    device_fingerprint VARCHAR(255),
    geolocation JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_file_interactions_campaign_id ON file_interactions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_file_interactions_target_email ON file_interactions(target_email);
CREATE INDEX IF NOT EXISTS idx_file_interactions_created_at ON file_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_file_interactions_interaction_type ON file_interactions(interaction_type);

-- Enable RLS on file_interactions table
ALTER TABLE file_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for file_interactions (same as campaign_metrics)
CREATE POLICY "Users can view their own file interactions" ON file_interactions
    FOR SELECT USING (
        campaign_id IN (
            SELECT id FROM campaigns WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own file interactions" ON file_interactions
    FOR INSERT WITH CHECK (
        campaign_id IN (
            SELECT id FROM campaigns WHERE user_id = auth.uid()
        )
    );

-- Add file_interactions to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE file_interactions;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_file_interactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_file_interactions_updated_at
    BEFORE UPDATE ON file_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_file_interactions_updated_at();

-- Create function to get file interaction statistics
CREATE OR REPLACE FUNCTION get_file_interaction_stats(campaign_uuid UUID)
RETURNS TABLE (
    total_file_downloads BIGINT,
    total_file_opens BIGINT,
    unique_file_downloaders BIGINT,
    unique_file_openers BIGINT,
    file_download_rate NUMERIC,
    file_open_rate NUMERIC
) AS $$
DECLARE
    total_targets BIGINT;
BEGIN
    -- Get total targets for this campaign
    SELECT COUNT(DISTINCT target_email) INTO total_targets
    FROM campaign_metrics 
    WHERE campaign_id = campaign_uuid;
    
    -- If no targets, return zeros
    IF total_targets = 0 THEN
        total_targets := 1; -- Avoid division by zero
    END IF;
    
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN interaction_type = 'download_attempt' THEN 1 ELSE 0 END), 0) as total_file_downloads,
        COALESCE(SUM(CASE WHEN interaction_type = 'file_open_attempt' THEN 1 ELSE 0 END), 0) as total_file_opens,
        COALESCE(COUNT(DISTINCT CASE WHEN interaction_type = 'download_attempt' THEN target_email END), 0) as unique_file_downloaders,
        COALESCE(COUNT(DISTINCT CASE WHEN interaction_type = 'file_open_attempt' THEN target_email END), 0) as unique_file_openers,
        ROUND(
            (COALESCE(COUNT(DISTINCT CASE WHEN interaction_type = 'download_attempt' THEN target_email END), 0)::NUMERIC / total_targets::NUMERIC) * 100, 
            2
        ) as file_download_rate,
        ROUND(
            (COALESCE(COUNT(DISTINCT CASE WHEN interaction_type = 'file_open_attempt' THEN target_email END), 0)::NUMERIC / total_targets::NUMERIC) * 100, 
            2
        ) as file_open_rate
    FROM file_interactions 
    WHERE campaign_id = campaign_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
