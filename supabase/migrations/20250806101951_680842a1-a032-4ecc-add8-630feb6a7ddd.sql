-- Add template source tracking columns to email_templates table
ALTER TABLE public.email_templates 
ADD COLUMN IF NOT EXISTS template_source TEXT DEFAULT 'manual' CHECK (template_source IN ('manual', 'ai_generated', 'industry_template', 'duplicated'));

ALTER TABLE public.email_templates 
ADD COLUMN IF NOT EXISTS source_template_id UUID REFERENCES public.email_templates(id);

ALTER TABLE public.email_templates 
ADD COLUMN IF NOT EXISTS template_history JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.email_templates 
ADD COLUMN IF NOT EXISTS effectiveness_score NUMERIC DEFAULT 0;

ALTER TABLE public.email_templates 
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;

ALTER TABLE public.email_templates 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create template analytics table for tracking performance
CREATE TABLE IF NOT EXISTS public.template_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.email_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  campaign_id UUID REFERENCES public.campaigns(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS for template analytics
ALTER TABLE public.template_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for template analytics
CREATE POLICY "Users can view their own template analytics"
ON public.template_analytics
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own template analytics"
ON public.template_analytics
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_templates_source ON public.email_templates(template_source);
CREATE INDEX IF NOT EXISTS idx_email_templates_tags ON public.email_templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_template_analytics_template_id ON public.template_analytics(template_id);
CREATE INDEX IF NOT EXISTS idx_template_analytics_metric_type ON public.template_analytics(metric_type);

-- Create function to update template usage count
CREATE OR REPLACE FUNCTION public.increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.email_templates 
  SET usage_count = usage_count + 1 
  WHERE id = NEW.template_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically increment usage count when template is used in a campaign
DROP TRIGGER IF EXISTS increment_template_usage_trigger ON public.campaigns;
CREATE TRIGGER increment_template_usage_trigger
  AFTER INSERT ON public.campaigns
  FOR EACH ROW
  WHEN (NEW.template_id IS NOT NULL)
  EXECUTE FUNCTION public.increment_template_usage();