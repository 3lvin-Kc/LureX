-- Create educational progress tracking tables
CREATE TABLE public.phishing_education_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid NOT NULL,
  target_email text NOT NULL,
  session_token text NOT NULL UNIQUE,
  phishing_template_type text,
  clicked_indicators jsonb DEFAULT '[]'::jsonb,
  missed_red_flags jsonb DEFAULT '[]'::jsonb,
  time_to_click integer, -- seconds from email send to click
  interaction_patterns jsonb DEFAULT '{}'::jsonb,
  education_completed boolean DEFAULT false,
  education_started_at timestamp with time zone,
  education_completed_at timestamp with time zone,
  learning_score numeric DEFAULT 0,
  engagement_metrics jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create learning modules content table
CREATE TABLE public.learning_modules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_name text NOT NULL,
  module_type text NOT NULL, -- 'phishing_indicators', 'email_security', 'url_analysis', etc.
  difficulty_level text NOT NULL DEFAULT 'beginner',
  content_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  interactive_elements jsonb DEFAULT '[]'::jsonb,
  quiz_questions jsonb DEFAULT '[]'::jsonb,
  estimated_duration integer DEFAULT 300, -- seconds
  effectiveness_score numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user learning progress tracking
CREATE TABLE public.user_learning_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  education_session_id uuid NOT NULL REFERENCES phishing_education_sessions(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES learning_modules(id),
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  score numeric DEFAULT 0,
  time_spent integer DEFAULT 0, -- seconds
  interactions jsonb DEFAULT '[]'::jsonb,
  quiz_responses jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create achievement system
CREATE TABLE public.security_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  achievement_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  badge_icon text,
  points integer DEFAULT 0,
  criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user achievements tracking
CREATE TABLE public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  education_session_id uuid NOT NULL REFERENCES phishing_education_sessions(id),
  achievement_id uuid NOT NULL REFERENCES security_achievements(id),
  earned_at timestamp with time zone DEFAULT now(),
  UNIQUE(education_session_id, achievement_id)
);

-- Insert default learning modules
INSERT INTO public.learning_modules (module_name, module_type, difficulty_level, content_data, interactive_elements, quiz_questions) VALUES
('Phishing Email Indicators', 'phishing_indicators', 'beginner', 
  '{"title": "How to Spot Phishing Emails", "sections": [{"heading": "Common Red Flags", "content": "Learn to identify suspicious emails before clicking"}, {"heading": "Sender Analysis", "content": "Check sender authenticity and domain verification"}]}',
  '[{"type": "interactive_checklist", "title": "Identify Red Flags", "items": ["Urgent language", "Suspicious sender", "Generic greeting", "Poor grammar", "Suspicious links"]}]',
  '[{"question": "What is the first thing you should check in a suspicious email?", "options": ["The sender address", "The subject line", "The attachments", "The links"], "correct": 0}]'
),
('URL Safety Analysis', 'url_analysis', 'intermediate',
  '{"title": "Safe URL Practices", "sections": [{"heading": "URL Structure", "content": "Understanding legitimate vs malicious URLs"}, {"heading": "Domain Verification", "content": "How to verify website authenticity"}]}',
  '[{"type": "url_analyzer", "title": "Analyze This URL", "sample_urls": ["https://paypal.com-secure-login.fake.com", "https://www.paypal.com"]}]',
  '[{"question": "Which URL is safer?", "options": ["paypal-login.com", "www.paypal.com", "paypal.secure-site.com", "paypal.verification.net"], "correct": 1}]'
);

-- Insert default achievements
INSERT INTO public.security_achievements (achievement_type, title, description, badge_icon, points, criteria) VALUES
('first_education', 'Security Rookie', 'Completed your first security education session', '🎓', 10, '{"type": "education_completed", "count": 1}'),
('perfect_score', 'Eagle Eye', 'Achieved 100% on security awareness quiz', '🦅', 25, '{"type": "quiz_score", "minimum": 100}'),
('quick_learner', 'Quick Learner', 'Completed education in under 2 minutes', '⚡', 15, '{"type": "completion_time", "maximum": 120}'),
('red_flag_master', 'Red Flag Detective', 'Identified all phishing indicators correctly', '🕵️', 20, '{"type": "indicators_identified", "percentage": 100}');

-- Create indexes for better performance
CREATE INDEX idx_education_sessions_campaign ON phishing_education_sessions(campaign_id);
CREATE INDEX idx_education_sessions_token ON phishing_education_sessions(session_token);
CREATE INDEX idx_user_learning_sessions_education ON user_learning_sessions(education_session_id);
CREATE INDEX idx_user_achievements_session ON user_achievements(education_session_id);

-- Create triggers for updated_at
CREATE TRIGGER update_education_sessions_updated_at
  BEFORE UPDATE ON phishing_education_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_modules_updated_at
  BEFORE UPDATE ON learning_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();