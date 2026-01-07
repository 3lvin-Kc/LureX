-- Add missing architecture_plan_established field to project_states table
-- This field is required by the ProjectState model but was missing from the original migration

-- Check if column exists before adding it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'project_states'
        AND column_name = 'architecture_plan_established'
    ) THEN
        ALTER TABLE project_states
        ADD COLUMN architecture_plan_established BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
END $$;

-- Create index for queries filtering on this field (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_project_states_architecture_plan_established'
    ) THEN
        CREATE INDEX idx_project_states_architecture_plan_established
        ON project_states(architecture_plan_established);
    END IF;
END $$;

-- Add comment for documentation
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'project_states'
        AND column_name = 'architecture_plan_established'
    ) THEN
        COMMENT ON COLUMN project_states.architecture_plan_established
        IS 'Indicates whether an architecture plan has been established for this project state';
    END IF;
END $$;
