-- Enable RLS on all new tables
ALTER TABLE public.phishing_education_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for phishing_education_sessions (public but trackable by session token)
CREATE POLICY "Anyone can access education sessions with valid token" 
ON public.phishing_education_sessions 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create RLS policies for learning_modules (public content)
CREATE POLICY "Anyone can view active learning modules" 
ON public.learning_modules 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage learning modules" 
ON public.learning_modules 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Create RLS policies for user_learning_sessions (linked to education sessions)
CREATE POLICY "Anyone can access learning sessions" 
ON public.user_learning_sessions 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create RLS policies for security_achievements (public read-only)
CREATE POLICY "Anyone can view active achievements" 
ON public.security_achievements 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage achievements" 
ON public.security_achievements 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Create RLS policies for user_achievements (public but linked to sessions)
CREATE POLICY "Anyone can access user achievements" 
ON public.user_achievements 
FOR ALL 
USING (true)
WITH CHECK (true);