-- Enable real-time for campaign_metrics table
ALTER TABLE public.campaign_metrics REPLICA IDENTITY FULL;

-- Add campaign_metrics to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_metrics;