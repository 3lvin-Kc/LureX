-- Advanced Reporting Engine Database Schema

-- Report templates table for custom report builder
CREATE TABLE public.report_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  configuration JSONB NOT NULL DEFAULT '{}',
  report_type TEXT NOT NULL DEFAULT 'custom',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ROI metrics tracking
CREATE TABLE public.roi_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  campaign_id UUID,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  training_hours_saved DECIMAL(10,2) DEFAULT 0,
  incident_prevention_count INTEGER DEFAULT 0,
  cost_per_training_hour DECIMAL(10,2) DEFAULT 50.00,
  incident_cost_average DECIMAL(10,2) DEFAULT 10000.00,
  total_roi DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Compliance report configurations
CREATE TABLE public.compliance_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  framework_type TEXT NOT NULL, -- 'SOX', 'GDPR', 'ISO27001', etc.
  configuration JSONB NOT NULL DEFAULT '{}',
  last_generated_at TIMESTAMP WITH TIME ZONE,
  next_due_date DATE,
  is_automated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Benchmark data for industry comparisons
CREATE TABLE public.benchmark_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  industry TEXT NOT NULL,
  company_size TEXT NOT NULL, -- 'small', 'medium', 'large', 'enterprise'
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  period_year INTEGER NOT NULL,
  period_quarter INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Scheduled reports
CREATE TABLE public.scheduled_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_template_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  schedule_cron TEXT NOT NULL, -- cron expression
  recipients JSONB NOT NULL DEFAULT '[]', -- array of email addresses
  delivery_format TEXT NOT NULL DEFAULT 'pdf', -- 'pdf', 'csv', 'xlsx'
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  next_send_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Executive dashboard configurations
CREATE TABLE public.executive_dashboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  widgets JSONB NOT NULL DEFAULT '[]',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmark_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_dashboards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for report_templates
CREATE POLICY "Users can view own report templates" ON public.report_templates
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own report templates" ON public.report_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own report templates" ON public.report_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own report templates" ON public.report_templates
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for roi_metrics
CREATE POLICY "Users can view own ROI metrics" ON public.roi_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ROI metrics" ON public.roi_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ROI metrics" ON public.roi_metrics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ROI metrics" ON public.roi_metrics
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for compliance_reports
CREATE POLICY "Users can view own compliance reports" ON public.compliance_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own compliance reports" ON public.compliance_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own compliance reports" ON public.compliance_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own compliance reports" ON public.compliance_reports
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for benchmark_data (public read access for comparison)
CREATE POLICY "Everyone can view benchmark data" ON public.benchmark_data
  FOR SELECT USING (true);

-- RLS Policies for scheduled_reports
CREATE POLICY "Users can view own scheduled reports" ON public.scheduled_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own scheduled reports" ON public.scheduled_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled reports" ON public.scheduled_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled reports" ON public.scheduled_reports
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for executive_dashboards
CREATE POLICY "Users can view own executive dashboards" ON public.executive_dashboards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own executive dashboards" ON public.executive_dashboards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own executive dashboards" ON public.executive_dashboards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own executive dashboards" ON public.executive_dashboards
  FOR DELETE USING (auth.uid() = user_id);

-- Add foreign key constraints
ALTER TABLE public.scheduled_reports 
ADD CONSTRAINT fk_scheduled_reports_report_template 
FOREIGN KEY (report_template_id) REFERENCES public.report_templates(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_report_templates_user_id ON public.report_templates(user_id);
CREATE INDEX idx_roi_metrics_user_id ON public.roi_metrics(user_id);
CREATE INDEX idx_roi_metrics_campaign_id ON public.roi_metrics(campaign_id);
CREATE INDEX idx_compliance_reports_user_id ON public.compliance_reports(user_id);
CREATE INDEX idx_compliance_reports_framework ON public.compliance_reports(framework_type);
CREATE INDEX idx_benchmark_data_industry ON public.benchmark_data(industry, company_size);
CREATE INDEX idx_scheduled_reports_user_id ON public.scheduled_reports(user_id);
CREATE INDEX idx_scheduled_reports_next_send ON public.scheduled_reports(next_send_at);
CREATE INDEX idx_executive_dashboards_user_id ON public.executive_dashboards(user_id);

-- Update timestamp triggers
CREATE TRIGGER update_report_templates_updated_at
  BEFORE UPDATE ON public.report_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_roi_metrics_updated_at
  BEFORE UPDATE ON public.roi_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_reports_updated_at
  BEFORE UPDATE ON public.compliance_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_reports_updated_at
  BEFORE UPDATE ON public.scheduled_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_executive_dashboards_updated_at
  BEFORE UPDATE ON public.executive_dashboards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample benchmark data for industry comparisons
INSERT INTO public.benchmark_data (industry, company_size, metric_name, metric_value, period_year, period_quarter) VALUES
  ('Technology', 'small', 'click_rate', 15.2, 2024, 1),
  ('Technology', 'medium', 'click_rate', 12.8, 2024, 1),
  ('Technology', 'large', 'click_rate', 10.5, 2024, 1),
  ('Technology', 'enterprise', 'click_rate', 8.2, 2024, 1),
  ('Healthcare', 'small', 'click_rate', 18.7, 2024, 1),
  ('Healthcare', 'medium', 'click_rate', 16.3, 2024, 1),
  ('Healthcare', 'large', 'click_rate', 14.1, 2024, 1),
  ('Healthcare', 'enterprise', 'click_rate', 11.8, 2024, 1),
  ('Finance', 'small', 'click_rate', 13.9, 2024, 1),
  ('Finance', 'medium', 'click_rate', 11.5, 2024, 1),
  ('Finance', 'large', 'click_rate', 9.2, 2024, 1),
  ('Finance', 'enterprise', 'click_rate', 7.1, 2024, 1),
  ('Manufacturing', 'small', 'click_rate', 20.3, 2024, 1),
  ('Manufacturing', 'medium', 'click_rate', 17.8, 2024, 1),
  ('Manufacturing', 'large', 'click_rate', 15.4, 2024, 1),
  ('Manufacturing', 'enterprise', 'click_rate', 12.9, 2024, 1),
  ('Technology', 'small', 'submit_rate', 8.1, 2024, 1),
  ('Technology', 'medium', 'submit_rate', 6.7, 2024, 1),
  ('Technology', 'large', 'submit_rate', 5.2, 2024, 1),
  ('Technology', 'enterprise', 'submit_rate', 3.8, 2024, 1),
  ('Healthcare', 'small', 'submit_rate', 9.8, 2024, 1),
  ('Healthcare', 'medium', 'submit_rate', 8.4, 2024, 1),
  ('Healthcare', 'large', 'submit_rate', 7.1, 2024, 1),
  ('Healthcare', 'enterprise', 'submit_rate', 5.7, 2024, 1),
  ('Finance', 'small', 'submit_rate', 7.2, 2024, 1),
  ('Finance', 'medium', 'submit_rate', 5.9, 2024, 1),
  ('Finance', 'large', 'submit_rate', 4.6, 2024, 1),
  ('Finance', 'enterprise', 'submit_rate', 3.3, 2024, 1),
  ('Manufacturing', 'small', 'submit_rate', 11.5, 2024, 1),
  ('Manufacturing', 'medium', 'submit_rate', 9.8, 2024, 1),
  ('Manufacturing', 'large', 'submit_rate', 8.2, 2024, 1),
  ('Manufacturing', 'enterprise', 'submit_rate', 6.7, 2024, 1);