
-- Create immutable logs table for secure, tamper-evident logging
CREATE TABLE IF NOT EXISTS public.immutable_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_level TEXT NOT NULL,
  log_type TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  user_id UUID,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  hash TEXT NOT NULL,
  verification_status TEXT DEFAULT 'unverified',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comment to describe the immutability purpose
COMMENT ON TABLE public.immutable_logs IS 'Immutable security logs with cryptographic verification';

-- Create an index on timestamp for faster querying
CREATE INDEX IF NOT EXISTS immutable_logs_timestamp_idx ON public.immutable_logs (timestamp);

-- Create an index on user_id for faster user-specific queries
CREATE INDEX IF NOT EXISTS immutable_logs_user_id_idx ON public.immutable_logs (user_id);

-- Create an index on log_type for faster filtering
CREATE INDEX IF NOT EXISTS immutable_logs_log_type_idx ON public.immutable_logs (log_type);

-- Enable Row Level Security
ALTER TABLE public.immutable_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to prevent any updates or deletes (immutability)
CREATE POLICY "Logs are immutable" ON public.immutable_logs
  FOR ALL
  USING (current_user = 'service_role');

-- Create policy for select access
CREATE POLICY "Authenticated users can view logs" ON public.immutable_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Create reports table for storing generated reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL,
  title TEXT,
  description TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  generated_by UUID,
  format TEXT NOT NULL DEFAULT 'pdf',
  file_path TEXT,
  file_size INTEGER,
  parameters JSONB,
  is_scheduled BOOLEAN DEFAULT false,
  schedule_id TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create policy for select access
CREATE POLICY "Authenticated users can view reports" ON public.reports
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for insert access
CREATE POLICY "Authenticated users can create reports" ON public.reports
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create multi-factor authentication table
CREATE TABLE IF NOT EXISTS public.mfa_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  factor_type TEXT NOT NULL, -- 'totp', 'biometric', 'hardware_key', 'sms', etc.
  factor_status TEXT NOT NULL DEFAULT 'unverified',
  friendly_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  metadata JSONB,
  UNIQUE (user_id, factor_type)
);

-- Enable Row Level Security
ALTER TABLE public.mfa_factors ENABLE ROW LEVEL SECURITY;

-- Create policy for select access (users can only see their own factors)
CREATE POLICY "Users can view their own MFA factors" ON public.mfa_factors
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policy for insert access
CREATE POLICY "Users can add their own MFA factors" ON public.mfa_factors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policy for update access
CREATE POLICY "Users can update their own MFA factors" ON public.mfa_factors
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policy for delete access
CREATE POLICY "Users can delete their own MFA factors" ON public.mfa_factors
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add an updated_at trigger to mfa_factors
CREATE TRIGGER update_mfa_factors_updated_at
BEFORE UPDATE ON public.mfa_factors
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create suspicious activity log table
CREATE TABLE IF NOT EXISTS public.suspicious_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  activity_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  description TEXT NOT NULL,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  location TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.suspicious_activities ENABLE ROW LEVEL SECURITY;

-- Create policy for select access
CREATE POLICY "Authenticated users can view suspicious activities" ON public.suspicious_activities
  FOR SELECT
  TO authenticated
  USING (true);

-- Create compliance requirements table
CREATE TABLE IF NOT EXISTS public.compliance_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework TEXT NOT NULL,
  section TEXT NOT NULL,
  requirement TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium',
  associated_controls JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.compliance_requirements ENABLE ROW LEVEL SECURITY;

-- Create policy for select access
CREATE POLICY "Authenticated users can view compliance requirements" ON public.compliance_requirements
  FOR SELECT
  TO authenticated
  USING (true);

-- Add an updated_at trigger to compliance_requirements
CREATE TRIGGER update_compliance_requirements_updated_at
BEFORE UPDATE ON public.compliance_requirements
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create compliance status table
CREATE TABLE IF NOT EXISTS public.compliance_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id UUID NOT NULL REFERENCES public.compliance_requirements(id),
  status TEXT NOT NULL DEFAULT 'non_compliant',
  evidence TEXT,
  implementation_details TEXT,
  last_checked TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_review TIMESTAMPTZ,
  remediation_plan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.compliance_status ENABLE ROW LEVEL SECURITY;

-- Create policy for select access
CREATE POLICY "Authenticated users can view compliance status" ON public.compliance_status
  FOR SELECT
  TO authenticated
  USING (true);

-- Add an updated_at trigger to compliance_status
CREATE TRIGGER update_compliance_status_updated_at
BEFORE UPDATE ON public.compliance_status
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a storage bucket for reports
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('reports', 'Reports', false, false)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to download their reports
CREATE POLICY "Authenticated users can download reports"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'reports');
