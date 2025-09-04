import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EducationSession {
  id: string;
  campaign_id: string;
  target_email: string;
  session_token: string;
  phishing_template_type?: string;
  time_to_click?: number;
  education_completed: boolean;
  education_started_at?: string;
  education_completed_at?: string;
  learning_score: number;
  engagement_metrics: any;
  created_at: string;
}

export interface EducationAnalytics {
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  averageTimeToComplete: number;
  completionRate: number;
  riskDistribution: { high: number; medium: number; low: number };
  achievementsEarned: number;
}

export function useEducationSessions() {
  const [sessions, setSessions] = useState<EducationSession[]>([]);
  const [analytics, setAnalytics] = useState<EducationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEducationSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error("Not authenticated");
      }

      // Get education sessions for user's campaigns
      const { data: userCampaigns } = await supabase
        .from('campaigns')
        .select('id')
        .eq('user_id', user.user.id);

      if (!userCampaigns || userCampaigns.length === 0) {
        setSessions([]);
        setAnalytics({
          totalSessions: 0,
          completedSessions: 0,
          averageScore: 0,
          averageTimeToComplete: 0,
          completionRate: 0,
          riskDistribution: { high: 0, medium: 0, low: 0 },
          achievementsEarned: 0
        });
        return;
      }

      const campaignIds = userCampaigns.map(c => c.id);

      const { data: educationSessions, error } = await supabase
        .from('phishing_education_sessions')
        .select('*')
        .in('campaign_id', campaignIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSessions(educationSessions || []);

      // Calculate analytics
      const analytics = calculateAnalytics(educationSessions || []);
      setAnalytics(analytics);

    } catch (err) {
      console.error('Error fetching education sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch education sessions');
      toast({
        title: "Error",
        description: "Failed to load education sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (sessions: EducationSession[]): EducationAnalytics => {
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.education_completed).length;
    
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    
    const completedScores = sessions
      .filter(s => s.education_completed && s.learning_score > 0)
      .map(s => s.learning_score);
    
    const averageScore = completedScores.length > 0 
      ? completedScores.reduce((acc, score) => acc + score, 0) / completedScores.length 
      : 0;

    // Calculate average time to complete (in minutes)
    const completedWithTimes = sessions.filter(s => 
      s.education_completed && 
      s.education_started_at && 
      s.education_completed_at
    );
    
    const averageTimeToComplete = completedWithTimes.length > 0
      ? completedWithTimes.reduce((acc, session) => {
          const startTime = new Date(session.education_started_at!).getTime();
          const endTime = new Date(session.education_completed_at!).getTime();
          return acc + (endTime - startTime);
        }, 0) / completedWithTimes.length / (1000 * 60) // Convert to minutes
      : 0;

    // Calculate risk distribution based on time to click
    const riskDistribution = sessions.reduce(
      (acc, session) => {
        if (session.time_to_click !== undefined) {
          if (session.time_to_click < 10) {
            acc.high++;
          } else if (session.time_to_click < 30) {
            acc.medium++;
          } else {
            acc.low++;
          }
        }
        return acc;
      },
      { high: 0, medium: 0, low: 0 }
    );

    return {
      totalSessions,
      completedSessions,
      averageScore: Math.round(averageScore),
      averageTimeToComplete: Math.round(averageTimeToComplete * 10) / 10, // Round to 1 decimal
      completionRate: Math.round(completionRate),
      riskDistribution,
      achievementsEarned: 0 // TODO: Calculate from achievements table
    };
  };

  const getSessionsByTimeRange = (days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return sessions.filter(session => 
      new Date(session.created_at) >= cutoffDate
    );
  };

  const getCompletionTrend = () => {
    const last30Days = getSessionsByTimeRange(30);
    const dailyData = new Map<string, { total: number; completed: number }>();

    // Initialize the last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData.set(dateStr, { total: 0, completed: 0 });
    }

    // Populate with actual data
    last30Days.forEach(session => {
      const dateStr = session.created_at.split('T')[0];
      const dayData = dailyData.get(dateStr) || { total: 0, completed: 0 };
      dayData.total++;
      if (session.education_completed) {
        dayData.completed++;
      }
      dailyData.set(dateStr, dayData);
    });

    return Array.from(dailyData.entries()).map(([date, data]) => ({
      date,
      completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
      total: data.total,
      completed: data.completed
    }));
  };

  useEffect(() => {
    fetchEducationSessions();
  }, []);

  return {
    sessions,
    analytics,
    loading,
    error,
    refetch: fetchEducationSessions,
    getSessionsByTimeRange,
    getCompletionTrend
  };
}