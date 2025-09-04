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
    const { sessionToken, phishingType = 'login', timeToClick = 0 } = await req.json();

    if (!sessionToken) {
      return new Response('Session token required', { status: 400 });
    }

    // Get education session data
    const { data: session, error: sessionError } = await supabase
      .from('phishing_education_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single();

    if (sessionError || !session) {
      return new Response('Invalid session', { status: 404 });
    }

    // Get relevant learning modules
    const { data: modules } = await supabase
      .from('learning_modules')
      .select('*')
      .eq('is_active', true)
      .in('module_type', ['phishing_indicators', 'email_security'])
      .order('difficulty_level');

    // Generate personalized content based on user behavior
    const personalizedContent = generatePersonalizedContent({
      phishingType,
      timeToClick,
      session,
      modules: modules || []
    });

    // Update session with education start
    await supabase
      .from('phishing_education_sessions')
      .update({
        education_started_at: new Date().toISOString(),
        phishing_template_type: phishingType,
        time_to_click: timeToClick
      })
      .eq('session_token', sessionToken);

    return new Response(JSON.stringify({
      success: true,
      content: personalizedContent,
      modules: modules || []
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Education content generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate educational content' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});

function generatePersonalizedContent(params: {
  phishingType: string;
  timeToClick: number;
  session: any;
  modules: any[];
}) {
  const { phishingType, timeToClick } = params;
  
  // Analyze user behavior
  const isQuickClicker = timeToClick < 10; // Less than 10 seconds
  const riskLevel = isQuickClicker ? 'high' : 'medium';
  
  // Generate personalized message
  const redFlags = identifyMissedRedFlags(phishingType);
  const recommendations = generateRecommendations(riskLevel, phishingType);
  
  return {
    title: "🚨 You've Been Phished!",
    subtitle: "This was a simulated phishing attack - Let's learn how to stay safe",
    riskLevel,
    personalizedMessage: generatePersonalizedMessage(timeToClick, phishingType),
    missedRedFlags: redFlags,
    recommendations,
    nextSteps: [
      "Complete the interactive security training below",
      "Learn to identify phishing indicators",
      "Practice with real-world examples",
      "Apply your knowledge in future emails"
    ],
    estimatedLearningTime: "5-8 minutes"
  };
}

function identifyMissedRedFlags(phishingType: string) {
  const commonRedFlags = {
    login: [
      "Generic greeting (no personal name)",
      "Urgent language creating time pressure",
      "Suspicious sender domain",
      "Request for sensitive information",
      "Grammatical errors or poor formatting"
    ],
    financial: [
      "Unexpected financial notifications",
      "Requests to verify account information",
      "Suspicious payment requests",
      "Unfamiliar sender addresses"
    ],
    social: [
      "Friend requests from unknown accounts",
      "Suspicious link sharing",
      "Requests for personal information",
      "Too-good-to-be-true offers"
    ]
  };

  return commonRedFlags[phishingType] || commonRedFlags.login;
}

function generateRecommendations(riskLevel: string, phishingType: string) {
  const baseRecommendations = [
    "Always verify sender identity before clicking links",
    "Look for HTTPS and legitimate domain names",
    "Be suspicious of urgent or threatening language",
    "When in doubt, contact the organization directly"
  ];

  if (riskLevel === 'high') {
    return [
      "⚠️ High Risk: You clicked very quickly - slow down and analyze emails carefully",
      ...baseRecommendations,
      "Consider enabling two-factor authentication",
      "Use a password manager for secure credentials"
    ];
  }

  return baseRecommendations;
}

function generatePersonalizedMessage(timeToClick: number, phishingType: string) {
  if (timeToClick < 5) {
    return "You clicked almost immediately! This suggests you might be vulnerable to phishing attacks. Let's work on building your security awareness.";
  } else if (timeToClick < 15) {
    return "You clicked fairly quickly. Taking more time to analyze emails can help you spot potential threats before they cause harm.";
  } else {
    return "You took some time before clicking, which is good practice. Now let's learn how to identify the specific warning signs you should look for.";
  }
}