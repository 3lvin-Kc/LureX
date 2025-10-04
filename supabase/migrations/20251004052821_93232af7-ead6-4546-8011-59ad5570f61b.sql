-- Enable RLS on tables missing protection
ALTER TABLE public.phishing_education_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_achievements ENABLE ROW LEVEL SECURITY;

-- Policies for phishing_education_sessions
-- Only campaign owners can view their education sessions
CREATE POLICY "Users can view education sessions for their campaigns"
ON public.phishing_education_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = phishing_education_sessions.campaign_id
    AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert education sessions for their campaigns"
ON public.phishing_education_sessions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = phishing_education_sessions.campaign_id
    AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update education sessions for their campaigns"
ON public.phishing_education_sessions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = phishing_education_sessions.campaign_id
    AND campaigns.user_id = auth.uid()
  )
);

-- Policies for user_learning_sessions
-- Only campaign owners can view learning sessions
CREATE POLICY "Users can view learning sessions for their campaigns"
ON public.user_learning_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.phishing_education_sessions pes
    JOIN public.campaigns c ON c.id = pes.campaign_id
    WHERE pes.id = user_learning_sessions.education_session_id
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert learning sessions for their campaigns"
ON public.user_learning_sessions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.phishing_education_sessions pes
    JOIN public.campaigns c ON c.id = pes.campaign_id
    WHERE pes.id = user_learning_sessions.education_session_id
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update learning sessions for their campaigns"
ON public.user_learning_sessions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.phishing_education_sessions pes
    JOIN public.campaigns c ON c.id = pes.campaign_id
    WHERE pes.id = user_learning_sessions.education_session_id
    AND c.user_id = auth.uid()
  )
);

-- Policies for learning_modules
-- All authenticated users can view modules (training content)
CREATE POLICY "Authenticated users can view learning modules"
ON public.learning_modules
FOR SELECT
TO authenticated
USING (is_active = true);

-- Only admins would insert/update modules (no policy = blocked for regular users)

-- Policies for user_achievements
-- Only campaign owners can view achievements
CREATE POLICY "Users can view achievements for their campaigns"
ON public.user_achievements
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.phishing_education_sessions pes
    JOIN public.campaigns c ON c.id = pes.campaign_id
    WHERE pes.id = user_achievements.education_session_id
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert achievements for their campaigns"
ON public.user_achievements
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.phishing_education_sessions pes
    JOIN public.campaigns c ON c.id = pes.campaign_id
    WHERE pes.id = user_achievements.education_session_id
    AND c.user_id = auth.uid()
  )
);

-- Policies for security_achievements
-- All authenticated users can view achievement definitions
CREATE POLICY "Authenticated users can view security achievements"
ON public.security_achievements
FOR SELECT
TO authenticated
USING (is_active = true);