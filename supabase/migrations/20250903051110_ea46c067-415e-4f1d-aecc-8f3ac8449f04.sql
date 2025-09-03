-- Clean up intelligence engine database tables
DROP TABLE IF EXISTS template_variables CASCADE;
DROP TABLE IF EXISTS context_events CASCADE;

-- Keep industry_templates for AI generator reference but clean up admin policies
-- (they're already secure from previous migration)