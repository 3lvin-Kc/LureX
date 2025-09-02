-- Security fix: Restrict access to industry_templates and benchmark_data tables
-- These tables currently allow public read access which exposes sensitive business data

-- Remove existing overly permissive RLS policies
DROP POLICY IF EXISTS "Industry templates are publicly readable" ON public.industry_templates;
DROP POLICY IF EXISTS "Everyone can view benchmark data" ON public.benchmark_data;

-- Create secure RLS policies for industry_templates
-- Only authenticated users can view templates, and only admins can modify
CREATE POLICY "Authenticated users can view industry templates"
  ON public.industry_templates
  FOR SELECT
  TO authenticated
  USING (true);

-- Create secure RLS policies for benchmark_data  
-- Only authenticated users can view benchmark data
CREATE POLICY "Authenticated users can view benchmark data"
  ON public.benchmark_data
  FOR SELECT  
  TO authenticated
  USING (true);

-- Create admin role check function for secure operations
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

-- Allow only admins to modify industry_templates
CREATE POLICY "Admins can modify industry templates"
  ON public.industry_templates
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Allow only admins to modify benchmark_data
CREATE POLICY "Admins can modify benchmark data"
  ON public.benchmark_data
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Update profiles table to ensure proper role enforcement
-- Add constraint to ensure only valid roles are assigned
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_role_check' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('user', 'admin', 'moderator'));
  END IF;
END $$;

-- Create security audit log function
CREATE OR REPLACE FUNCTION public.log_admin_action()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if user is admin performing sensitive operations
  IF public.is_admin() THEN
    INSERT INTO public.audit_log (
      user_id,
      table_name,
      action,
      row_id,
      old_data,
      new_data,
      timestamp
    ) VALUES (
      auth.uid(),
      TG_TABLE_NAME,
      TG_OP,
      CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.id
        ELSE NEW.id
      END,
      CASE 
        WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)
        WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD)
        ELSE NULL
      END,
      CASE 
        WHEN TG_OP = 'DELETE' THEN NULL
        ELSE row_to_json(NEW)
      END,
      NOW()
    );
  END IF;
  
  RETURN CASE 
    WHEN TG_OP = 'DELETE' THEN OLD
    ELSE NEW
  END;
END;
$$;

-- Create audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  table_name TEXT NOT NULL,
  action TEXT NOT NULL,
  row_id UUID,
  old_data JSONB,
  new_data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Create triggers for audit logging on sensitive tables
DROP TRIGGER IF EXISTS audit_industry_templates ON public.industry_templates;
CREATE TRIGGER audit_industry_templates
  AFTER INSERT OR UPDATE OR DELETE ON public.industry_templates
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

DROP TRIGGER IF EXISTS audit_benchmark_data ON public.benchmark_data;  
CREATE TRIGGER audit_benchmark_data
  AFTER INSERT OR UPDATE OR DELETE ON public.benchmark_data
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();