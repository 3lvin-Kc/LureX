-- Create project_identities table for Project Identity management
-- This table stores immutable project identities that define the core nature of each project

CREATE TABLE project_identities (
    identity_id UUID PRIMARY KEY,
    project_id UUID UNIQUE,
    core_definition JSONB NOT NULL,
    characteristics TEXT[] NOT NULL DEFAULT '{}',
    scope JSONB NOT NULL,
    scale JSONB NOT NULL,
    architecture JSONB NOT NULL,
    evolution JSONB NOT NULL,
    technical_foundation JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    immutable BOOLEAN NOT NULL DEFAULT TRUE,

    -- Constraints to ensure data integrity
    CONSTRAINT chk_technical_foundation_stack CHECK (
        (technical_foundation->>'stack') = 'Flutter'
    ),
    CONSTRAINT chk_immutable_true CHECK (
        immutable = TRUE
    )
);

-- Indexes for performance optimization
CREATE INDEX idx_project_identities_project_id ON project_identities(project_id);
CREATE INDEX idx_project_identities_created_at ON project_identities(created_at DESC);

-- B-tree indexes for specific field queries
CREATE INDEX idx_project_identities_stack ON project_identities ((technical_foundation->>'stack'));
CREATE INDEX idx_project_identities_domain ON project_identities ((core_definition->>'domain'));

-- GIN indexes for full JSONB document search and containment queries
CREATE INDEX idx_project_identities_core_definition_gin ON project_identities USING GIN (core_definition);
CREATE INDEX idx_project_identities_technical_foundation_gin ON project_identities USING GIN (technical_foundation);
CREATE INDEX idx_project_identities_scope_gin ON project_identities USING GIN (scope);

-- GIN index for text array search on characteristics
CREATE INDEX idx_project_identities_characteristics_gin ON project_identities USING GIN (characteristics);

-- Enable Row Level Security
ALTER TABLE project_identities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project identities
CREATE POLICY "Users can view project identities" ON project_identities
    FOR SELECT USING (
        true  -- For now, allow all authenticated users to view
    );

CREATE POLICY "Users can insert project identities" ON project_identities
    FOR INSERT WITH CHECK (
        true  -- For now, allow all authenticated users to insert
    );

CREATE POLICY "Project identities are immutable after creation" ON project_identities
    FOR UPDATE USING (
        false  -- Prevent all updates since identities are immutable
    );

CREATE POLICY "Project identities cannot be deleted" ON project_identities
    FOR DELETE USING (
        false  -- Prevent deletion to maintain audit trail
    );

-- Add comments for documentation
COMMENT ON TABLE project_identities IS 'Immutable project identities that define the core nature and characteristics of each Flutter project';
COMMENT ON COLUMN project_identities.identity_id IS 'Unique identifier for the project identity';
COMMENT ON COLUMN project_identities.project_id IS 'Optional project identifier, null for zero-to-one projects';
COMMENT ON COLUMN project_identities.core_definition IS 'Core project definition including purpose, domain, and type';
COMMENT ON COLUMN project_identities.characteristics IS 'Array of project characteristics and features';
COMMENT ON COLUMN project_identities.scope IS 'Project scope definition with included/excluded features';
COMMENT ON COLUMN project_identities.scale IS 'Project scale information including user base and complexity';
COMMENT ON COLUMN project_identities.architecture IS 'High-level architecture principles and constraints';
COMMENT ON COLUMN project_identities.evolution IS 'Project evolution paths and growth possibilities';
COMMENT ON COLUMN project_identities.technical_foundation IS 'Technical foundation constrained to Flutter stack';
COMMENT ON COLUMN project_identities.immutable IS 'Ensures project identities cannot be modified after creation';
