
-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  category TEXT DEFAULT 'general',
  description TEXT,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create phishing pages table
CREATE TABLE public.phishing_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  html_content TEXT NOT NULL,
  css_content TEXT,
  js_content TEXT,
  is_custom BOOLEAN DEFAULT true,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create target lists table
CREATE TABLE public.target_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  target_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create targets table
CREATE TABLE public.targets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES public.target_lists ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  position TEXT,
  department TEXT,
  phone TEXT,
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  template_id UUID REFERENCES public.email_templates ON DELETE SET NULL,
  target_list_id UUID REFERENCES public.target_lists ON DELETE SET NULL,
  phishing_page_id UUID REFERENCES public.phishing_pages ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'in_progress', 'completed', 'canceled', 'failed')),
  schedule_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
--this is newly created and just for testing purpose if it sucks during testing , just fuckin delete this.

-- Create campaign metrics table
CREATE TABLE public.campaign_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  target_email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  data_submitted_at TIMESTAMP WITH TIME ZONE,
  reported_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  additional_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique combination of campaign and target email
  UNIQUE(campaign_id, target_email)
);

-- Create indexes for campaign_metrics
CREATE INDEX idx_campaign_metrics_campaign_id ON public.campaign_metrics(campaign_id);
CREATE INDEX idx_campaign_metrics_target_email ON public.campaign_metrics(target_email);
CREATE INDEX idx_campaign_metrics_sent_at ON public.campaign_metrics(sent_at);
CREATE INDEX idx_campaign_metrics_opened_at ON public.campaign_metrics(opened_at);
CREATE INDEX idx_campaign_metrics_clicked_at ON public.campaign_metrics(clicked_at);
CREATE INDEX idx_campaign_metrics_data_submitted_at ON public.campaign_metrics(data_submitted_at);
-- from there to here L82-112 , just fuckin delete if this even tryin to suck
-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phishing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for email_templates
CREATE POLICY "Users can view own templates" ON public.email_templates
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own templates" ON public.email_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON public.email_templates
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON public.email_templates
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for phishing_pages
CREATE POLICY "Users can view own pages" ON public.phishing_pages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own pages" ON public.phishing_pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pages" ON public.phishing_pages
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pages" ON public.phishing_pages
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for target_lists
CREATE POLICY "Users can view own lists" ON public.target_lists
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own lists" ON public.target_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lists" ON public.target_lists
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lists" ON public.target_lists
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for targets
CREATE POLICY "Users can view targets in own lists" ON public.targets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.target_lists 
      WHERE id = targets.list_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create targets in own lists" ON public.targets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.target_lists 
      WHERE id = targets.list_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update targets in own lists" ON public.targets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.target_lists 
      WHERE id = targets.list_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete targets in own lists" ON public.targets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.target_lists 
      WHERE id = targets.list_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for campaigns
CREATE POLICY "Users can view own campaigns" ON public.campaigns
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own campaigns" ON public.campaigns
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own campaigns" ON public.campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for campaign_metrics
CREATE POLICY "Users can view own campaign metrics" ON public.campaign_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE id = campaign_metrics.campaign_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create campaign metrics" ON public.campaign_metrics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE id = campaign_metrics.campaign_id AND user_id = auth.uid()
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update target list count
CREATE OR REPLACE FUNCTION public.update_target_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.target_lists 
    SET target_count = target_count + 1 
    WHERE id = NEW.list_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.target_lists 
    SET target_count = target_count - 1 
    WHERE id = OLD.list_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to maintain target count
CREATE TRIGGER target_count_insert
  AFTER INSERT ON public.targets
  FOR EACH ROW EXECUTE FUNCTION public.update_target_count();

CREATE TRIGGER target_count_delete
  AFTER DELETE ON public.targets
  FOR EACH ROW EXECUTE FUNCTION public.update_target_count();
