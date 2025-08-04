-- Advanced Simulation Scenarios: Social Media Integration Tables

-- Social media platforms configuration
CREATE TABLE public.social_media_platforms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform_name TEXT NOT NULL CHECK (platform_name IN ('linkedin', 'facebook', 'twitter', 'instagram')),
  oauth_token TEXT,
  oauth_token_secret TEXT,
  refresh_token TEXT,
  access_token_expires_at TIMESTAMP WITH TIME ZONE,
  platform_user_id TEXT,
  platform_username TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Social media phishing campaigns
CREATE TABLE public.social_media_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES public.social_media_platforms(id) ON DELETE CASCADE,
  template_id UUID,
  target_profiles JSONB NOT NULL DEFAULT '[]'::jsonb,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('connection_request', 'direct_message', 'post_interaction', 'profile_cloning')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'completed', 'paused', 'failed')),
  schedule_time TIMESTAMP WITH TIME ZONE,
  engagement_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Platform-specific phishing templates
CREATE TABLE public.social_media_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform_name TEXT NOT NULL CHECK (platform_name IN ('linkedin', 'facebook', 'twitter', 'instagram')),
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('connection_request', 'direct_message', 'post', 'comment', 'profile_description')),
  content TEXT NOT NULL,
  media_attachments JSONB DEFAULT '[]'::jsonb,
  personalization_variables JSONB DEFAULT '{}'::jsonb,
  industry_type TEXT DEFAULT 'general',
  sophistication_level TEXT DEFAULT 'medium' CHECK (sophistication_level IN ('low', 'medium', 'high')),
  is_public BOOLEAN DEFAULT false,
  success_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Social media campaign metrics
CREATE TABLE public.social_media_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.social_media_campaigns(id) ON DELETE CASCADE,
  target_profile_id TEXT NOT NULL,
  platform_name TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('sent', 'delivered', 'viewed', 'clicked', 'responded', 'connected', 'reported')),
  action_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_address TEXT,
  additional_data JSONB DEFAULT '{}'::jsonb
);

-- Intelligent Training System Tables

-- Training modules
CREATE TABLE public.training_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  module_name TEXT NOT NULL,
  module_type TEXT NOT NULL CHECK (module_type IN ('video', 'interactive', 'quiz', 'simulation', 'document')),
  category TEXT NOT NULL CHECK (category IN ('phishing_awareness', 'social_engineering', 'password_security', 'data_protection', 'incident_response')),
  industry_type TEXT DEFAULT 'general',
  difficulty_level TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration INTEGER NOT NULL, -- in minutes
  content_url TEXT,
  content_data JSONB DEFAULT '{}'::jsonb,
  learning_objectives JSONB DEFAULT '[]'::jsonb,
  prerequisites JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN DEFAULT false,
  is_mandatory BOOLEAN DEFAULT false,
  effectiveness_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User training progress tracking
CREATE TABLE public.user_training_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_id UUID REFERENCES public.training_modules(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed', 'skipped')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  score NUMERIC,
  time_spent INTEGER DEFAULT 0, -- in minutes
  attempts INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  weakness_areas JSONB DEFAULT '[]'::jsonb,
  strength_areas JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Training assessments and knowledge checks
CREATE TABLE public.training_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_id UUID REFERENCES public.training_modules(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('pre_test', 'post_test', 'knowledge_check', 'practical_simulation')),
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  user_responses JSONB DEFAULT '[]'::jsonb,
  score NUMERIC,
  max_score NUMERIC NOT NULL,
  pass_threshold NUMERIC NOT NULL DEFAULT 70,
  time_taken INTEGER, -- in seconds
  passed BOOLEAN,
  feedback JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adaptive learning algorithm data
CREATE TABLE public.adaptive_learning_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  learning_style TEXT CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading')),
  knowledge_gaps JSONB DEFAULT '[]'::jsonb,
  strength_areas JSONB DEFAULT '[]'::jsonb,
  learning_velocity NUMERIC DEFAULT 1.0,
  engagement_patterns JSONB DEFAULT '{}'::jsonb,
  risk_profile TEXT DEFAULT 'medium' CHECK (risk_profile IN ('low', 'medium', 'high')),
  recommended_path JSONB DEFAULT '[]'::jsonb,
  last_assessment_date TIMESTAMP WITH TIME ZONE,
  next_recommended_training DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Just-in-time training interventions
CREATE TABLE public.just_in_time_interventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trigger_event TEXT NOT NULL CHECK (trigger_event IN ('phishing_failure', 'suspicious_activity', 'policy_violation', 'scheduled_reminder')),
  trigger_campaign_id UUID,
  intervention_type TEXT NOT NULL CHECK (intervention_type IN ('immediate_training', 'warning_message', 'supervisor_notification', 'mandatory_module')),
  intervention_data JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'completed', 'ignored', 'expired')),
  priority_level TEXT NOT NULL DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
  delivered_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.social_media_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_learning_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.just_in_time_interventions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Social Media Tables

-- Social Media Platforms policies
CREATE POLICY "Users can manage their own platform connections" 
  ON public.social_media_platforms FOR ALL 
  USING (auth.uid() = user_id);

-- Social Media Campaigns policies
CREATE POLICY "Users can manage their own social media campaigns" 
  ON public.social_media_campaigns FOR ALL 
  USING (auth.uid() = user_id);

-- Social Media Templates policies
CREATE POLICY "Users can view public templates or own templates" 
  ON public.social_media_templates FOR SELECT 
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create templates" 
  ON public.social_media_templates FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" 
  ON public.social_media_templates FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" 
  ON public.social_media_templates FOR DELETE 
  USING (auth.uid() = user_id);

-- Social Media Metrics policies
CREATE POLICY "Users can view metrics for their own campaigns" 
  ON public.social_media_metrics FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.social_media_campaigns smc 
    WHERE smc.id = social_media_metrics.campaign_id 
    AND smc.user_id = auth.uid()
  ));

CREATE POLICY "Users can create metrics for their own campaigns" 
  ON public.social_media_metrics FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.social_media_campaigns smc 
    WHERE smc.id = social_media_metrics.campaign_id 
    AND smc.user_id = auth.uid()
  ));

-- RLS Policies for Training System Tables

-- Training Modules policies
CREATE POLICY "Users can view public modules or own modules" 
  ON public.training_modules FOR SELECT 
  USING (is_public = true OR auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create training modules" 
  ON public.training_modules FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own modules" 
  ON public.training_modules FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own modules" 
  ON public.training_modules FOR DELETE 
  USING (auth.uid() = user_id);

-- User Training Progress policies
CREATE POLICY "Users can manage their own training progress" 
  ON public.user_training_progress FOR ALL 
  USING (auth.uid() = user_id);

-- Training Assessments policies
CREATE POLICY "Users can manage their own assessments" 
  ON public.training_assessments FOR ALL 
  USING (auth.uid() = user_id);

-- Adaptive Learning Data policies
CREATE POLICY "Users can manage their own learning data" 
  ON public.adaptive_learning_data FOR ALL 
  USING (auth.uid() = user_id);

-- Just-in-Time Interventions policies
CREATE POLICY "Users can view their own interventions" 
  ON public.just_in_time_interventions FOR ALL 
  USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_social_media_platforms_updated_at
  BEFORE UPDATE ON public.social_media_platforms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_media_campaigns_updated_at
  BEFORE UPDATE ON public.social_media_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_media_templates_updated_at
  BEFORE UPDATE ON public.social_media_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_modules_updated_at
  BEFORE UPDATE ON public.training_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_training_progress_updated_at
  BEFORE UPDATE ON public.user_training_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_assessments_updated_at
  BEFORE UPDATE ON public.training_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_adaptive_learning_data_updated_at
  BEFORE UPDATE ON public.adaptive_learning_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_just_in_time_interventions_updated_at
  BEFORE UPDATE ON public.just_in_time_interventions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();