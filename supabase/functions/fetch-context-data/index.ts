import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContextRequest {
  industry_type?: string;
  event_types?: string[];
  company_domain?: string;
  keywords?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { industry_type, event_types, company_domain, keywords }: ContextRequest = await req.json();

    console.log('Fetching context data for:', { industry_type, event_types, company_domain, keywords });

    // Generate context events based on industry and current trends
    const contextEvents = await generateContextEvents(industry_type, event_types, keywords);

    // Fetch company-specific information if domain provided
    let companyContext = null;
    if (company_domain) {
      companyContext = await fetchCompanyContext(company_domain);
    }

    // Store context events in the database
    const storedEvents = await storeContextEvents(supabaseClient, user.id, contextEvents);

    return new Response(
      JSON.stringify({
        success: true,
        context_events: storedEvents,
        company_context: companyContext,
        generated_at: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error fetching context data:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function generateContextEvents(industryType?: string, eventTypes?: string[], keywords?: string[]) {
  const currentDate = new Date();
  const events = [];

  // Industry-specific events
  if (industryType) {
    switch (industryType) {
      case 'healthcare':
        events.push({
          event_type: 'security',
          event_title: 'HIPAA Compliance Audit Scheduled',
          event_description: 'Annual HIPAA compliance audit scheduled for next quarter',
          event_data: {
            audit_date: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            compliance_areas: ['data encryption', 'access controls', 'breach protocols'],
            required_training: 'HIPAA Security Updates 2024'
          },
          relevance_score: 0.9,
        });
        break;

      case 'finance':
        events.push({
          event_type: 'company',
          event_title: 'Quarterly SEC Filing Deadline',
          event_description: 'Q4 financial reports due for SEC filing',
          event_data: {
            filing_deadline: new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            form_type: '10-Q',
            reviewer_required: true,
            compliance_officer: 'Chief Financial Officer'
          },
          relevance_score: 0.85,
        });
        break;

      case 'technology':
        events.push({
          event_type: 'security',
          event_title: 'Critical Security Vulnerability Discovered',
          event_description: 'Zero-day vulnerability affecting enterprise systems',
          event_data: {
            cve_id: `CVE-2024-${Math.floor(Math.random() * 10000)}`,
            cvss_score: '9.8',
            affected_systems: 'Enterprise authentication servers',
            patch_available: true,
            severity: 'CRITICAL'
          },
          relevance_score: 0.95,
        });
        break;

      case 'legal':
        events.push({
          event_type: 'company',
          event_title: 'Discovery Deadline Approaching',
          event_description: 'Document discovery phase ending soon for active litigation',
          event_data: {
            case_number: `CASE-${Date.now().toString().slice(-6)}`,
            discovery_deadline: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            document_count: Math.floor(Math.random() * 500 + 100),
            client_name: 'Corporate Legal Matter',
            urgency: 'HIGH'
          },
          relevance_score: 0.8,
        });
        break;
    }
  }

  // Seasonal/general events
  const month = currentDate.getMonth();
  if (month === 11 || month === 0) { // December or January
    events.push({
      event_type: 'seasonal',
      event_title: 'Year-End Security Review',
      event_description: 'Annual security policy review and updates',
      event_data: {
        review_deadline: new Date(currentDate.getFullYear() + 1, 0, 31).toISOString(),
        areas: ['password policies', 'access reviews', 'incident response'],
        mandatory_training: true
      },
      relevance_score: 0.7,
    });
  }

  // News-based events (simulated trending topics)
  events.push({
    event_type: 'news',
    event_title: 'New Cybersecurity Regulations Announced',
    event_description: 'Government announces new data protection requirements',
    event_data: {
      effective_date: new Date(currentDate.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      compliance_requirements: ['multi-factor authentication', 'data encryption', 'incident reporting'],
      industry_impact: industryType || 'all industries'
    },
    relevance_score: 0.75,
  });

  return events.map(event => ({
    ...event,
    event_date: currentDate.toISOString().split('T')[0],
    is_active: true,
  }));
}

async function fetchCompanyContext(domain: string) {
  try {
    // Simulate company context gathering
    // In a real implementation, this would use APIs like:
    // - Company databases (Crunchbase, LinkedIn)
    // - News APIs (NewsAPI, Google News)
    // - Domain analysis tools

    const companyName = domain.split('.')[0];
    
    return {
      company_name: companyName.charAt(0).toUpperCase() + companyName.slice(1),
      domain: domain,
      industry_estimate: await estimateIndustry(domain),
      recent_news: [
        {
          title: `${companyName} announces new security initiative`,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'Industry News',
        },
        {
          title: `${companyName} expands operations`,
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'Business Journal',
        }
      ],
      estimated_size: Math.random() > 0.5 ? 'Enterprise' : 'Mid-market',
    };
  } catch (error) {
    console.error('Error fetching company context:', error);
    return null;
  }
}

async function estimateIndustry(domain: string): Promise<string> {
  // Simple domain-based industry estimation
  const domainLower = domain.toLowerCase();
  
  if (domainLower.includes('bank') || domainLower.includes('financial') || domainLower.includes('credit')) {
    return 'finance';
  } else if (domainLower.includes('health') || domainLower.includes('medical') || domainLower.includes('hospital')) {
    return 'healthcare';
  } else if (domainLower.includes('tech') || domainLower.includes('software') || domainLower.includes('dev')) {
    return 'technology';
  } else if (domainLower.includes('law') || domainLower.includes('legal') || domainLower.includes('attorney')) {
    return 'legal';
  } else if (domainLower.includes('edu') || domainLower.includes('university') || domainLower.includes('school')) {
    return 'education';
  } else if (domainLower.includes('gov') || domainLower.includes('government')) {
    return 'government';
  }
  
  return 'general';
}

async function storeContextEvents(supabaseClient: any, userId: string, events: any[]) {
  const storedEvents = [];
  
  for (const event of events) {
    try {
      const { data, error } = await supabaseClient
        .from('context_events')
        .insert([{
          user_id: userId,
          ...event,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error storing context event:', error);
        continue;
      }

      storedEvents.push(data);
    } catch (error) {
      console.error('Error storing context event:', error);
    }
  }

  return storedEvents;
}