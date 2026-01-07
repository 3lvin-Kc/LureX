 -- Migration: Add identity_id to project_states and create generated_artifacts table
-- This migration supports the Zero-to-One Code Generation Pipeline

-- ============================================================================
-- PART 1: Add identity_id to project_states for direct linking to ProjectIdentity
-- ============================================================================

-- Add identity_id column to project_states
ALTER TABLE project_states
ADD COLUMN IF NOT EXISTS identity_id UUID REFERENCES project_identities(identity_id) ON DELETE SET NULL;

-- Create index for faster lookups by identity_id
CREATE INDEX IF NOT EXISTS idx_project_states_identity_id ON project_states(identity_id);

-- Add comment for documentation
COMMENT ON COLUMN project_states.identity_id IS 'Direct link to project_identities.identity_id for Zero-to-One pipeline';

-- ============================================================================
-- PART 2: Create generated_artifacts table for storing code generation metadata
-- File content is stored in Supabase Storage bucket, not in the database
-- ============================================================================

CREATE TABLE IF NOT EXISTS generated_artifacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Foreign keys linking to project context
    project_state_id UUID NOT NULL REFERENCES project_states(id) ON DELETE CASCADE,
    identity_id UUID NOT NULL REFERENCES project_identities(identity_id) ON DELETE CASCADE,
    architecture_plan_id UUID NOT NULL REFERENCES architecture_plans(plan_id) ON DELETE CASCADE,

    -- File metadata (content stored in Supabase Storage)
    file_path TEXT NOT NULL,                    -- e.g., "lib/main.dart"
    file_name TEXT NOT NULL,                    -- e.g., "main.dart"
    storage_path TEXT NOT NULL,                 -- e.g., "projects/{project_state_id}/lib/main.dart"
    file_type TEXT NOT NULL CHECK (file_type IN ('dart', 'yaml', 'json', 'md', 'txt')),
    file_size_bytes INTEGER NOT NULL DEFAULT 0,

    -- File classification
    is_entry_point BOOLEAN NOT NULL DEFAULT FALSE,
    generation_order INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure unique file paths per project
    UNIQUE(project_state_id, file_path)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_artifacts_project_state_id ON generated_artifacts(project_state_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_identity_id ON generated_artifacts(identity_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_architecture_plan_id ON generated_artifacts(architecture_plan_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_file_type ON generated_artifacts(file_type);
CREATE INDEX IF NOT EXISTS idx_artifacts_is_entry_point ON generated_artifacts(is_entry_point) WHERE is_entry_point = TRUE;

-- Enable Row Level Security
ALTER TABLE generated_artifacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generated_artifacts
CREATE POLICY "Users can view generated artifacts" ON generated_artifacts
    FOR SELECT USING (true);

CREATE POLICY "Service role can insert artifacts" ON generated_artifacts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update artifacts" ON generated_artifacts
    FOR UPDATE USING (true);

CREATE POLICY "Service role can delete artifacts" ON generated_artifacts
    FOR DELETE USING (true);

-- Add comments for documentation
COMMENT ON TABLE generated_artifacts IS 'Metadata for generated Flutter code files. Actual file content stored in Supabase Storage bucket.';
COMMENT ON COLUMN generated_artifacts.project_state_id IS 'Reference to the project state this artifact belongs to';
COMMENT ON COLUMN generated_artifacts.identity_id IS 'Reference to the project identity that defined constraints for this artifact';
COMMENT ON COLUMN generated_artifacts.architecture_plan_id IS 'Reference to the architecture plan that guided generation';
COMMENT ON COLUMN generated_artifacts.file_path IS 'Relative file path within the Flutter project structure';
COMMENT ON COLUMN generated_artifacts.storage_path IS 'Full path in Supabase Storage bucket';
COMMENT ON COLUMN generated_artifacts.is_entry_point IS 'TRUE if this is the main.dart entry point file';
COMMENT ON COLUMN generated_artifacts.generation_order IS 'Order in which files were generated (for dependency tracking)';

-- ============================================================================
-- PART 3: Create generation_sessions table for tracking generation attempts
-- ============================================================================

CREATE TABLE IF NOT EXISTS generation_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Context
    project_state_id UUID NOT NULL REFERENCES project_states(id) ON DELETE CASCADE,
    identity_id UUID REFERENCES project_identities(identity_id) ON DELETE SET NULL,
    architecture_plan_id UUID REFERENCES architecture_plans(plan_id) ON DELETE SET NULL,

    -- User input
    user_prompt TEXT NOT NULL,

    -- Generation metadata
    status TEXT NOT NULL CHECK (status IN ('pending', 'generating', 'validating', 'uploading', 'completed', 'failed', 'retrying')),
    attempt_number INTEGER NOT NULL DEFAULT 1,
    max_attempts INTEGER NOT NULL DEFAULT 3,

    -- AI model information
    model_used TEXT,
    tokens_prompt INTEGER,
    tokens_completion INTEGER,
    tokens_total INTEGER,

    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    generation_time_ms INTEGER,

    -- Error tracking
    error_message TEXT,
    error_details JSONB,

    -- Results
    files_generated INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_generation_sessions_project_state_id ON generation_sessions(project_state_id);
CREATE INDEX IF NOT EXISTS idx_generation_sessions_status ON generation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_generation_sessions_created_at ON generation_sessions(created_at DESC);

-- Enable RLS
ALTER TABLE generation_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view generation sessions" ON generation_sessions
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage generation sessions" ON generation_sessions
    FOR ALL USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_generation_sessions_updated_at
    BEFORE UPDATE ON generation_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE generation_sessions IS 'Tracks code generation attempts including retries and errors';
COMMENT ON COLUMN generation_sessions.attempt_number IS 'Current attempt number (1-based)';
COMMENT ON COLUMN generation_sessions.status IS 'Current status of the generation session';

-- ============================================================================
-- PART 4: Create Supabase Storage bucket for generated projects
-- Note: This creates the bucket policy. The bucket itself may need to be created
-- via Supabase dashboard or CLI if it doesn't exist.
-- ============================================================================

-- Insert bucket if it doesn't exist (this may fail if bucket exists, which is OK)
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'generated-projects',
        'generated-projects',
        false,  -- Private bucket, accessed via signed URLs or service role
        5242880,  -- 5MB max file size
        ARRAY['text/plain', 'text/x-dart', 'application/x-yaml', 'application/json']
    )
    ON CONFLICT (id) DO NOTHING;
EXCEPTION
    WHEN others THEN
        -- Bucket might already exist or storage schema not available
        RAISE NOTICE 'Could not create storage bucket: %', SQLERRM;
END $$;

-- Storage policies (these will work if storage.objects table exists)
DO $$
BEGIN
    -- Policy: Service role can upload files
    DROP POLICY IF EXISTS "Service role can upload project files" ON storage.objects;
    CREATE POLICY "Service role can upload project files"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'generated-projects');

    -- Policy: Service role can read files
    DROP POLICY IF EXISTS "Service role can read project files" ON storage.objects;
    CREATE POLICY "Service role can read project files"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'generated-projects');

    -- Policy: Service role can delete files
    DROP POLICY IF EXISTS "Service role can delete project files" ON storage.objects;
    CREATE POLICY "Service role can delete project files"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'generated-projects');
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Could not create storage policies: %', SQLERRM;
END $$;
