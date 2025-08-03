-- Add dynamic content capabilities to email templates
ALTER TABLE email_templates 
ADD COLUMN personalization_variables JSONB DEFAULT '{}',
ADD COLUMN industry_type TEXT DEFAULT 'general',
ADD COLUMN context_aware BOOLEAN DEFAULT false,
ADD COLUMN dynamic_content BOOLEAN DEFAULT false;

-- Create template variables table for reusable dynamic content
CREATE TABLE template_variables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  variable_key TEXT NOT NULL,
  description TEXT,
  data_source TEXT NOT NULL, -- 'profile', 'company', 'news', 'custom'
  data_mapping JSONB NOT NULL DEFAULT '{}',
  industry_specific BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE template_variables ENABLE ROW LEVEL SECURITY;

-- RLS policies for template variables
CREATE POLICY "Users can create own template variables" 
ON template_variables 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own template variables" 
ON template_variables 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own template variables" 
ON template_variables 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own template variables" 
ON template_variables 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create industry-specific template library
CREATE TABLE industry_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_type TEXT NOT NULL,
  template_name TEXT NOT NULL,
  template_data JSONB NOT NULL,
  sophistication_level TEXT DEFAULT 'medium', -- 'basic', 'medium', 'advanced'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE industry_templates ENABLE ROW LEVEL SECURITY;

-- Make industry templates publicly readable
CREATE POLICY "Industry templates are publicly readable" 
ON industry_templates 
FOR SELECT 
USING (true);

-- Create context events table for context-aware phishing
CREATE TABLE context_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- 'news', 'company', 'security', 'seasonal'
  event_title TEXT NOT NULL,
  event_description TEXT,
  event_data JSONB NOT NULL DEFAULT '{}',
  event_date DATE NOT NULL,
  relevance_score NUMERIC DEFAULT 0.5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE context_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for context events
CREATE POLICY "Users can create own context events" 
ON context_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own context events" 
ON context_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own context events" 
ON context_events 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own context events" 
ON context_events 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_template_variables_updated_at
  BEFORE UPDATE ON template_variables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_industry_templates_updated_at
  BEFORE UPDATE ON industry_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_context_events_updated_at
  BEFORE UPDATE ON context_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert industry-specific template data
INSERT INTO industry_templates (industry_type, template_name, template_data, sophistication_level) VALUES
('healthcare', 'HIPAA Compliance Alert', '{
  "subject": "Urgent: HIPAA Compliance Update Required for {{first_name}} {{last_name}}",
  "html_content": "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #ddd;\"><div style=\"background: #1f4e79; color: white; padding: 20px; text-align: center;\"><h1>{{company_name}} Healthcare</h1><p>HIPAA Compliance Department</p></div><div style=\"padding: 30px;\"><h2>Immediate Action Required</h2><p>Dear {{first_name}},</p><p>Our records indicate that your HIPAA compliance certification has expired. As a {{position}} in the {{department}} department, you must complete the updated training within 48 hours to maintain access to patient data systems.</p><div style=\"background: #f8f9fa; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0;\"><strong>Compliance Status:</strong> EXPIRED<br><strong>Last Updated:</strong> {{last_compliance_date}}<br><strong>Department:</strong> {{department}}</div><p>Click below to access the secure training portal:</p><a href=\"{{phishing_link}}\" style=\"display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0;\">Complete HIPAA Training</a><p>Failure to complete this training will result in immediate suspension of system access.</p><p>Best regards,<br>HIPAA Compliance Team<br>{{company_name}}</p></div></div>",
  "variables": ["first_name", "last_name", "company_name", "position", "department", "last_compliance_date", "phishing_link"],
  "category": "compliance"
}', 'advanced'),

('finance', 'SEC Regulatory Update', '{
  "subject": "SEC Filing Deadline - Action Required for {{first_name}} {{last_name}}",
  "html_content": "<div style=\"font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #fff; border: 2px solid #0066cc;\"><div style=\"background: #0066cc; color: white; padding: 20px;\"><h1>{{company_name}} Financial Services</h1><p>Regulatory Compliance Division</p></div><div style=\"padding: 30px;\"><h2>Urgent: SEC Filing Deadline Approaching</h2><p>Dear {{first_name}},</p><p>This is a time-sensitive notification regarding upcoming SEC regulatory filings for Q{{quarter}} {{year}}. As {{position}} in our {{department}} department, your immediate attention is required.</p><div style=\"background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0;\"><strong>Filing Type:</strong> Form 10-Q<br><strong>Deadline:</strong> {{filing_deadline}}<br><strong>Status:</strong> PENDING REVIEW<br><strong>Assigned Reviewer:</strong> {{first_name}} {{last_name}}</div><p>Please access the secure portal to review and approve the draft filings:</p><a href=\"{{phishing_link}}\" style=\"display: inline-block; background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0;\">Access SEC Portal</a><p>Note: This link expires in 24 hours for security purposes.</p><p>Regards,<br>SEC Compliance Team<br>{{company_name}} Financial Services</p></div></div>",
  "variables": ["first_name", "last_name", "company_name", "position", "department", "quarter", "year", "filing_deadline", "phishing_link"],
  "category": "regulatory"
}', 'advanced'),

('legal', 'Case Document Review', '{
  "subject": "Urgent: Case {{case_number}} - Document Review Required",
  "html_content": "<div style=\"font-family: Times, serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #333;\"><div style=\"background: #333; color: white; padding: 20px;\"><h1>{{firm_name}}</h1><p>Legal Document Management System</p></div><div style=\"padding: 30px;\"><h2>Time-Sensitive Document Review</h2><p>Dear {{first_name}},</p><p>You have been assigned as reviewing attorney for case documents that require immediate attention. The discovery deadline is approaching rapidly.</p><div style=\"background: #f8f9fa; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;\"><strong>Case Number:</strong> {{case_number}}<br><strong>Client:</strong> {{client_name}}<br><strong>Discovery Deadline:</strong> {{discovery_deadline}}<br><strong>Assigned Attorney:</strong> {{first_name}} {{last_name}}<br><strong>Documents Pending:</strong> {{document_count}}</div><p>Access the secure document portal to begin your review:</p><a href=\"{{phishing_link}}\" style=\"display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0;\">Access Document Portal</a><p>Please note: All document access is logged and monitored for client confidentiality.</p><p>Best regards,<br>Document Management Team<br>{{firm_name}}</p></div></div>",
  "variables": ["first_name", "last_name", "firm_name", "case_number", "client_name", "discovery_deadline", "document_count", "phishing_link"],
  "category": "legal"
}', 'advanced'),

('technology', 'Security Patch Update', '{
  "subject": "Critical Security Patch - {{system_name}} Update Required",
  "html_content": "<div style=\"font-family: Courier, monospace; max-width: 600px; margin: 0 auto; background: #000; color: #00ff00; border: 2px solid #00ff00;\"><div style=\"background: #00ff00; color: #000; padding: 20px; text-align: center;\"><h1>{{company_name}} IT Security</h1><p>System Administration</p></div><div style=\"padding: 30px;\"><h2>[CRITICAL] Security Patch Available</h2><p>System Administrator: {{first_name}} {{last_name}}</p><p>A critical security vulnerability has been identified in {{system_name}}. Immediate patching is required to prevent potential data breaches.</p><div style=\"background: #ff0000; color: #fff; padding: 15px; margin: 20px 0; border: 1px solid #fff;\"><strong>Vulnerability Level:</strong> CRITICAL<br><strong>CVSS Score:</strong> {{cvss_score}}<br><strong>Affected Systems:</strong> {{affected_systems}}<br><strong>Patch Available:</strong> YES</div><p>Download and install the security patch immediately:</p><a href=\"{{phishing_link}}\" style=\"display: inline-block; background: #ff0000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0;\">Download Security Patch</a><p>WARNING: Delaying this update may result in system compromise.</p><p>IT Security Team<br>{{company_name}}</p></div></div>",
  "variables": ["first_name", "last_name", "company_name", "system_name", "cvss_score", "affected_systems", "phishing_link"],
  "category": "security"
}', 'advanced');