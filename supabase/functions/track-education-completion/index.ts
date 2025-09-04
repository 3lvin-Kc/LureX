import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionToken, score, timeSpent, completed } = await req.json();

    if (!sessionToken) {
      return new Response('Session token required', { status: 400 });
    }

    // Update education session with completion data
    const { error: updateError } = await supabase
      .from('phishing_education_sessions')
      .update({
        education_completed: completed,
        education_completed_at: new Date().toISOString(),
        learning_score: score,
        engagement_metrics: {
          time_spent_seconds: Math.round(timeSpent / 1000),
          quiz_score: score,
          completed_modules: ['phishing_awareness_basic'],
          interactions: ['quiz_completed']
        }
      })
      .eq('session_token', sessionToken);

    if (updateError) {
      console.error('Error updating education session:', updateError);
    }

    // Check for and award achievements
    const achievementsAwarded = await checkAndAwardAchievements(sessionToken, score, timeSpent);

    console.log(`Education completed - Token: ${sessionToken}, Score: ${score}, Time: ${timeSpent}ms`);

    return new Response(JSON.stringify({
      success: true,
      score,
      timeSpent: Math.round(timeSpent / 1000),
      achievementsAwarded
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Education completion tracking error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to track education completion' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});

async function checkAndAwardAchievements(sessionToken: string, score: number, timeSpent: number) {
  const achievementsAwarded = [];
  
  try {
    // Get education session
    const { data: session } = await supabase
      .from('phishing_education_sessions')
      .select('id')
      .eq('session_token', sessionToken)
      .single();

    if (!session) return achievementsAwarded;

    // Get available achievements
    const { data: achievements } = await supabase
      .from('security_achievements')
      .select('*')
      .eq('is_active', true);

    if (!achievements) return achievementsAwarded;

    // Check each achievement criteria
    for (const achievement of achievements) {
      const criteria = achievement.criteria;
      let shouldAward = false;

      switch (criteria.type) {
        case 'education_completed':
          shouldAward = true; // First completion
          break;
        case 'quiz_score':
          shouldAward = score >= criteria.minimum;
          break;
        case 'completion_time':
          shouldAward = (timeSpent / 1000) <= criteria.maximum;
          break;
        default:
          continue;
      }

      if (shouldAward) {
        // Check if already awarded
        const { data: existing } = await supabase
          .from('user_achievements')
          .select('id')
          .eq('education_session_id', session.id)
          .eq('achievement_id', achievement.id)
          .single();

        if (!existing) {
          // Award achievement
          const { error } = await supabase
            .from('user_achievements')
            .insert({
              education_session_id: session.id,
              achievement_id: achievement.id
            });

          if (!error) {
            achievementsAwarded.push({
              title: achievement.title,
              description: achievement.description,
              badge_icon: achievement.badge_icon,
              points: achievement.points
            });
          }
        }
      }
    }

  } catch (error) {
    console.error('Error checking achievements:', error);
  }

  return achievementsAwarded;
}