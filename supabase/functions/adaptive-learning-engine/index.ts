import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface LearningAnalysis {
  knowledge_gaps: string[];
  strength_areas: string[];
  learning_velocity: number;
  risk_profile: 'low' | 'medium' | 'high';
  recommended_path: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, user_id, assessment_data } = await req.json();

    // Get user authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const targetUserId = user_id || user.id;

    switch (action) {
      case 'analyze_learning_data': {
        const analysis = await analyzeLearningData(supabase, targetUserId);
        return new Response(JSON.stringify(analysis), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'generate_learning_path': {
        const path = await generatePersonalizedPath(supabase, targetUserId);
        return new Response(JSON.stringify(path), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update_learning_profile': {
        if (!assessment_data) {
          throw new Error('Assessment data is required for updating learning profile');
        }
        
        const updated = await updateLearningProfile(supabase, targetUserId, assessment_data);
        return new Response(JSON.stringify(updated), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'trigger_intervention': {
        const intervention = await triggerJustInTimeIntervention(supabase, targetUserId, assessment_data);
        return new Response(JSON.stringify(intervention), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error('Invalid action specified');
    }

  } catch (error) {
    console.error('Adaptive learning engine error:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeLearningData(supabase: any, userId: string): Promise<LearningAnalysis> {
  // Get user's training progress
  const { data: progress } = await supabase
    .from('user_training_progress')
    .select('*')
    .eq('user_id', userId);

  // Get user's assessment results
  const { data: assessments } = await supabase
    .from('training_assessments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  // Get campaign metrics for failure analysis
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select(`
      *,
      campaign_metrics (*)
    `)
    .eq('user_id', userId);

  // Analyze knowledge gaps
  const knowledge_gaps = analyzeKnowledgeGaps(progress, assessments);
  
  // Identify strength areas
  const strength_areas = identifyStrengthAreas(progress, assessments);
  
  // Calculate learning velocity
  const learning_velocity = calculateLearningVelocity(progress);
  
  // Determine risk profile based on phishing test results
  const risk_profile = calculateRiskProfile(campaigns);
  
  // Generate recommended learning path
  const recommended_path = await generateRecommendedModules(supabase, knowledge_gaps, strength_areas);

  return {
    knowledge_gaps,
    strength_areas,
    learning_velocity,
    risk_profile,
    recommended_path
  };
}

function analyzeKnowledgeGaps(progress: any[], assessments: any[]): string[] {
  const gaps: string[] = [];
  
  // Analyze failed assessments
  assessments?.forEach(assessment => {
    if (!assessment.passed && assessment.score < 70) {
      // Extract knowledge gaps from assessment feedback
      if (assessment.feedback?.weak_areas) {
        gaps.push(...assessment.feedback.weak_areas);
      }
    }
  });

  // Analyze incomplete or failed training modules
  progress?.forEach(p => {
    if (p.status === 'failed' || (p.status === 'completed' && p.score < 70)) {
      gaps.push(...(p.weakness_areas || []));
    }
  });

  return [...new Set(gaps)]; // Remove duplicates
}

function identifyStrengthAreas(progress: any[], assessments: any[]): string[] {
  const strengths: string[] = [];
  
  // Analyze successful assessments
  assessments?.forEach(assessment => {
    if (assessment.passed && assessment.score >= 80) {
      if (assessment.feedback?.strong_areas) {
        strengths.push(...assessment.feedback.strong_areas);
      }
    }
  });

  // Analyze completed training modules with high scores
  progress?.forEach(p => {
    if (p.status === 'completed' && p.score >= 80) {
      strengths.push(...(p.strength_areas || []));
    }
  });

  return [...new Set(strengths)];
}

function calculateLearningVelocity(progress: any[]): number {
  if (!progress || progress.length === 0) return 1.0;

  const avgTimeSpent = progress.reduce((sum, p) => sum + (p.time_spent || 0), 0) / progress.length;
  const avgProgress = progress.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / progress.length;
  
  // Higher velocity means faster learning (less time needed for high progress)
  return avgProgress > 0 ? Math.min(2.0, Math.max(0.1, avgProgress / Math.max(1, avgTimeSpent / 60))) : 1.0;
}

function calculateRiskProfile(campaigns: any[]): 'low' | 'medium' | 'high' {
  if (!campaigns || campaigns.length === 0) return 'medium';

  let totalTargets = 0;
  let failedTargets = 0;

  campaigns.forEach(campaign => {
    campaign.campaign_metrics?.forEach((metric: any) => {
      totalTargets++;
      if (metric.clicked_at || metric.data_submitted_at) {
        failedTargets++;
      }
    });
  });

  if (totalTargets === 0) return 'medium';

  const failureRate = failedTargets / totalTargets;
  
  if (failureRate > 0.3) return 'high';
  if (failureRate > 0.1) return 'medium';
  return 'low';
}

async function generateRecommendedModules(supabase: any, gaps: string[], strengths: string[]): Promise<string[]> {
  // Get available training modules
  const { data: modules } = await supabase
    .from('training_modules')
    .select('id, category, difficulty_level')
    .eq('is_public', true);

  const recommendations: string[] = [];

  // Prioritize modules that address knowledge gaps
  gaps.forEach(gap => {
    const relevantModules = modules?.filter((m: any) => 
      m.category.toLowerCase().includes(gap.toLowerCase()) ||
      gap.toLowerCase().includes(m.category.toLowerCase())
    );
    
    relevantModules?.forEach((module: any) => {
      recommendations.push(module.id);
    });
  });

  // Add advanced modules for strength areas
  strengths.forEach(strength => {
    const advancedModules = modules?.filter((m: any) => 
      (m.category.toLowerCase().includes(strength.toLowerCase()) ||
       strength.toLowerCase().includes(m.category.toLowerCase())) &&
      m.difficulty_level === 'advanced'
    );
    
    advancedModules?.forEach((module: any) => {
      recommendations.push(module.id);
    });
  });

  return [...new Set(recommendations)].slice(0, 5); // Top 5 recommendations
}

async function generatePersonalizedPath(supabase: any, userId: string) {
  const analysis = await analyzeLearningData(supabase, userId);
  
  // Update adaptive learning data
  await supabase
    .from('adaptive_learning_data')
    .upsert({
      user_id: userId,
      knowledge_gaps: analysis.knowledge_gaps,
      strength_areas: analysis.strength_areas,
      learning_velocity: analysis.learning_velocity,
      risk_profile: analysis.risk_profile,
      recommended_path: analysis.recommended_path,
      last_assessment_date: new Date().toISOString(),
      next_recommended_training: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
    }, {
      onConflict: 'user_id'
    });

  return analysis;
}

async function updateLearningProfile(supabase: any, userId: string, assessmentData: any) {
  // Update user training progress
  const { data, error } = await supabase
    .from('user_training_progress')
    .upsert({
      user_id: userId,
      module_id: assessmentData.module_id,
      status: assessmentData.status,
      progress_percentage: assessmentData.progress_percentage,
      score: assessmentData.score,
      time_spent: assessmentData.time_spent,
      weakness_areas: assessmentData.weakness_areas,
      strength_areas: assessmentData.strength_areas,
      last_accessed_at: new Date().toISOString(),
      completed_at: assessmentData.status === 'completed' ? new Date().toISOString() : null,
    }, {
      onConflict: 'user_id,module_id'
    });

  if (error) {
    throw new Error(`Failed to update learning profile: ${error.message}`);
  }

  // Regenerate learning path
  await generatePersonalizedPath(supabase, userId);

  return { success: true, data };
}

async function triggerJustInTimeIntervention(supabase: any, userId: string, triggerData: any) {
  const intervention = await supabase
    .from('just_in_time_interventions')
    .insert({
      user_id: userId,
      trigger_event: triggerData.trigger_event,
      trigger_campaign_id: triggerData.campaign_id,
      intervention_type: triggerData.intervention_type,
      intervention_data: triggerData.intervention_data,
      priority_level: triggerData.priority_level || 'medium',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    })
    .select()
    .single();

  return intervention;
}