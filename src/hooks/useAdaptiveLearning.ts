import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TrainingModule {
  id: string;
  module_name: string;
  module_type: 'video' | 'interactive' | 'quiz' | 'simulation' | 'document';
  category: 'phishing_awareness' | 'social_engineering' | 'password_security' | 'data_protection' | 'incident_response';
  industry_type: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration: number;
  content_url?: string;
  content_data: any;
  learning_objectives: string[];
  prerequisites: string[];
  is_public: boolean;
  is_mandatory: boolean;
  effectiveness_score: number;
}

export interface UserTrainingProgress {
  id: string;
  module_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  progress_percentage: number;
  score?: number;
  time_spent: number;
  attempts: number;
  started_at?: string;
  completed_at?: string;
  weakness_areas: string[];
  strength_areas: string[];
  training_modules?: TrainingModule;
}

export interface AdaptiveLearningData {
  learning_style?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  knowledge_gaps: string[];
  strength_areas: string[];
  learning_velocity: number;
  engagement_patterns: any;
  risk_profile: 'low' | 'medium' | 'high';
  recommended_path: string[];
  last_assessment_date?: string;
  next_recommended_training?: string;
}

export interface JustInTimeIntervention {
  id: string;
  trigger_event: 'phishing_failure' | 'suspicious_activity' | 'policy_violation' | 'scheduled_reminder';
  trigger_campaign_id?: string;
  intervention_type: 'immediate_training' | 'warning_message' | 'supervisor_notification' | 'mandatory_module';
  intervention_data: any;
  status: 'pending' | 'delivered' | 'completed' | 'ignored' | 'expired';
  priority_level: 'low' | 'medium' | 'high' | 'critical';
  delivered_at?: string;
  completed_at?: string;
  expires_at?: string;
  created_at: string;
}

export const useAdaptiveLearning = () => {
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [userProgress, setUserProgress] = useState<UserTrainingProgress[]>([]);
  const [learningData, setLearningData] = useState<AdaptiveLearningData | null>(null);
  const [interventions, setInterventions] = useState<JustInTimeIntervention[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTrainingModules = async (category?: string, difficultyLevel?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('training_modules')
        .select('*')
        .or('is_public.eq.true,user_id.eq.' + (await supabase.auth.getUser()).data.user?.id);

      if (category) {
        query = query.eq('category', category);
      }

      if (difficultyLevel) {
        query = query.eq('difficulty_level', difficultyLevel);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setTrainingModules(data as TrainingModule[] || []);
    } catch (error) {
      console.error('Error fetching training modules:', error);
      toast({
        title: "Error",
        description: "Failed to fetch training modules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_training_progress')
        .select(`
          *,
          training_modules (*)
        `)
        .order('last_accessed_at', { ascending: false });

      if (error) throw error;
      setUserProgress(data as UserTrainingProgress[] || []);
    } catch (error) {
      console.error('Error fetching user progress:', error);
      toast({
        title: "Error",
        description: "Failed to fetch training progress",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLearningData = async () => {
    try {
      const { data, error } = await supabase
        .from('adaptive_learning_data')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setLearningData(data as AdaptiveLearningData);
    } catch (error) {
      console.error('Error fetching learning data:', error);
    }
  };

  const fetchInterventions = async () => {
    try {
      const { data, error } = await supabase
        .from('just_in_time_interventions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setInterventions(data as JustInTimeIntervention[] || []);
    } catch (error) {
      console.error('Error fetching interventions:', error);
    }
  };

  const createTrainingModule = async (moduleData: Partial<TrainingModule>) => {
    try {
      const { data, error } = await supabase
        .from('training_modules')
        .insert([moduleData as any])
        .select()
        .single();

      if (error) throw error;

      await fetchTrainingModules();
      
      toast({
        title: "Success",
        description: "Training module created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating training module:', error);
      toast({
        title: "Error",
        description: "Failed to create training module",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTrainingProgress = async (moduleId: string, progressData: Partial<UserTrainingProgress>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_training_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          ...progressData,
          last_accessed_at: new Date().toISOString(),
        } as any, {
          onConflict: 'user_id,module_id'
        })
        .select()
        .single();

      if (error) throw error;

      // Update learning profile via adaptive learning engine
      await supabase.functions.invoke('adaptive-learning-engine', {
        body: {
          action: 'update_learning_profile',
          assessment_data: {
            module_id: moduleId,
            ...progressData
          }
        }
      });

      await fetchUserProgress();
      await fetchLearningData();
      
      toast({
        title: "Success",
        description: "Training progress updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating training progress:', error);
      toast({
        title: "Error",
        description: "Failed to update training progress",
        variant: "destructive",
      });
      throw error;
    }
  };

  const generateLearningPath = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('adaptive-learning-engine', {
        body: {
          action: 'generate_learning_path'
        }
      });

      if (error) throw error;

      setLearningData(data);
      
      toast({
        title: "Success",
        description: "Learning path updated based on your progress",
      });

      return data;
    } catch (error) {
      console.error('Error generating learning path:', error);
      toast({
        title: "Error",
        description: "Failed to generate personalized learning path",
        variant: "destructive",
      });
      throw error;
    }
  };

  const analyzeLearningData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('adaptive-learning-engine', {
        body: {
          action: 'analyze_learning_data'
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error analyzing learning data:', error);
      toast({
        title: "Error",
        description: "Failed to analyze learning data",
        variant: "destructive",
      });
      throw error;
    }
  };

  const completeIntervention = async (interventionId: string) => {
    try {
      const { error } = await supabase
        .from('just_in_time_interventions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', interventionId);

      if (error) throw error;

      await fetchInterventions();
      
      toast({
        title: "Success",
        description: "Training intervention completed",
      });
    } catch (error) {
      console.error('Error completing intervention:', error);
      toast({
        title: "Error",
        description: "Failed to complete intervention",
        variant: "destructive",
      });
    }
  };

  const startTrainingModule = async (moduleId: string) => {
    try {
      await updateTrainingProgress(moduleId, {
        status: 'in_progress',
        started_at: new Date().toISOString(),
        progress_percentage: 0,
        attempts: 1
      });
    } catch (error) {
      throw error;
    }
  };

  const completeTrainingModule = async (moduleId: string, score?: number, timeSpent?: number) => {
    try {
      await updateTrainingProgress(moduleId, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        progress_percentage: 100,
        score,
        time_spent: timeSpent
      });
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchTrainingModules();
    fetchUserProgress();
    fetchLearningData();
    fetchInterventions();
  }, []);

  return {
    trainingModules,
    userProgress,
    learningData,
    interventions,
    loading,
    fetchTrainingModules,
    fetchUserProgress,
    fetchLearningData,
    fetchInterventions,
    createTrainingModule,
    updateTrainingProgress,
    generateLearningPath,
    analyzeLearningData,
    completeIntervention,
    startTrainingModule,
    completeTrainingModule,
  };
};