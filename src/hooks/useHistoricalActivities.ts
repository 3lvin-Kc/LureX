import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HistoricalActivity {
  id: string;
  target_email: string;
  campaign_id: string;
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
  data_submitted_at?: string;
  reported_at?: string;
  file_downloaded_at?: string;
  user_agent?: string;
  ip_address?: string;
  additional_data?: any;
  campaigns: {
    id: string;
    name: string;
    status: string;
    created_at: string;
    simulation_type?: 'link' | 'file' | 'mixed';
  };
}

export const useHistoricalActivities = () => {
  const [activities, setActivities] = useState<HistoricalActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistoricalActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Fetch activities including file download events
      const { data: activities, error: activitiesError } = await supabase
        .from('campaign_metrics')
        .select(`
          id,
          target_email,
          campaign_id,
          sent_at,
          opened_at,
          clicked_at,
          data_submitted_at,
          reported_at,
          file_downloaded_at,
          user_agent,
          ip_address,
          additional_data,
          campaigns!inner(
            id,
            name,
            status,
            created_at,
            simulation_type
          )
        `)
        .eq('campaigns.user_id', user.id)
        .not('sent_at', 'is', null)
        .order('sent_at', { ascending: false })
        .limit(100);

      if (activitiesError) throw activitiesError;

      setActivities((activities || []) as HistoricalActivity[]);

    } catch (err: any) {
      console.error('Error fetching historical activities:', err);
      setError(err.message);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalActivities();
  }, []);

  return {
    activities,
    loading,
    error,
    refetch: fetchHistoricalActivities
  };
};
