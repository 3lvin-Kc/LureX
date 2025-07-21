-- Enable realtime for campaign_metrics table
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_metrics;

-- Ensure the table has replica identity for realtime updates
ALTER TABLE campaign_metrics REPLICA IDENTITY FULL;