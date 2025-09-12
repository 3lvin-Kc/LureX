-- Enable realtime for campaign_metrics table (only if not already added)
--i implement this cause of fuckin endless migration files error if it sucks just fuckin delete this.
DO $$
BEGIN
    -- Check if campaign_metrics is already in the publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'campaign_metrics'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE campaign_metrics;
    END IF;
END $$;

-- Ensure the table has replica identity for realtime updates
ALTER TABLE campaign_metrics REPLICA IDENTITY FULL;