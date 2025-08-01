-- Create custom_domains table for real domain management
CREATE TABLE public.custom_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  verified BOOLEAN NOT NULL DEFAULT false,
  ssl_enabled BOOLEAN NOT NULL DEFAULT false,
  dns_records JSONB NOT NULL DEFAULT '[]'::jsonb,
  verification_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own domains" 
ON public.custom_domains 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own domains" 
ON public.custom_domains 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own domains" 
ON public.custom_domains 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own domains" 
ON public.custom_domains 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add domain_id to campaigns table
ALTER TABLE public.campaigns 
ADD COLUMN domain_id UUID REFERENCES public.custom_domains(id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_domains_updated_at
BEFORE UPDATE ON public.custom_domains
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for custom_domains
ALTER TABLE public.custom_domains REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_domains;