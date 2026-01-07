-- Create the project_states table for Zero-to-One Mode Detection & Hard Boundary Layer

CREATE TYPE project_mode AS ENUM ('ZERO_TO_ONE', 'ONE_TO_N');

CREATE TABLE project_states (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id TEXT,
    artifact_count INTEGER NOT NULL DEFAULT 0,
    has_config BOOLEAN NOT NULL DEFAULT FALSE,
    architecture_decisions_recorded BOOLEAN NOT NULL DEFAULT FALSE,
    mode_locked project_mode NOT NULL DEFAULT 'ZERO_TO_ONE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by project_id
CREATE INDEX idx_project_states_project_id ON project_states(project_id);

-- Create index for faster lookups where project_id is null (for zero-to-one states)
CREATE INDEX idx_project_states_null_project_id ON project_states((project_id IS NULL)) WHERE project_id IS NULL;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_project_states_updated_at
    BEFORE UPDATE ON project_states
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE project_states ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view own project states" ON project_states
    FOR SELECT USING (
        true  -- For now, allow all authenticated users to view (restrictions can be added later)
    );

CREATE POLICY "Users can insert own project states" ON project_states
    FOR INSERT WITH CHECK (
        true  -- For now, allow all authenticated users to insert (restrictions can be added later)
    );

CREATE POLICY "Users can update own project states" ON project_states
    FOR UPDATE USING (
        true  -- For now, allow all authenticated users to update (restrictions can be added later)
    );
