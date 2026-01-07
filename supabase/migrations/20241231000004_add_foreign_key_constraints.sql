-- Add foreign key constraints to establish proper relational integrity
-- This migration adds referential integrity between related tables

-- First, we need to handle the fact that project_states.project_id is TEXT
-- but project_identities.project_id is UUID
-- We'll convert project_states.project_id to UUID type

-- Step 1: Add a new UUID column temporarily
ALTER TABLE project_states
ADD COLUMN project_id_uuid UUID;

-- Step 2: Convert existing TEXT project_id values to UUID where possible
-- This handles cases where project_id is already a valid UUID string
UPDATE project_states
SET project_id_uuid = project_id::UUID
WHERE project_id IS NOT NULL
AND project_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Step 3: Drop the old TEXT column
ALTER TABLE project_states DROP COLUMN project_id;

-- Step 4: Rename the new UUID column to project_id
ALTER TABLE project_states RENAME COLUMN project_id_uuid TO project_id;

-- Step 5: Update the existing index to use the new UUID column
DROP INDEX IF EXISTS idx_project_states_project_id;
CREATE INDEX idx_project_states_project_id ON project_states(project_id);

-- Step 6: Update the null project_id index
DROP INDEX IF EXISTS idx_project_states_null_project_id;
CREATE INDEX idx_project_states_null_project_id ON project_states((project_id IS NULL)) WHERE project_id IS NULL;

-- Step 7: Now add the foreign key constraint
ALTER TABLE project_states
ADD CONSTRAINT fk_project_states_project_id
FOREIGN KEY (project_id) REFERENCES project_identities(project_id) ON DELETE SET NULL;

-- Add index for better foreign key performance
CREATE INDEX idx_project_states_project_id_fk ON project_states(project_id) WHERE project_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON CONSTRAINT fk_project_states_project_id ON project_states
IS 'Foreign key constraint linking project states to their corresponding project identities';
