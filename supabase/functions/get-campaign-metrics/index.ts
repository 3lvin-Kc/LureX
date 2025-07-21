import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const campaignId = url.searchParams.get("campaign_id");
    const timeframe = url.searchParams.get("timeframe") || "30"; // days

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth header and validate user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Set auth for supabase client
    supabase.auth.setAuth(authHeader.replace("Bearer ", ""));

    let query = supabase.from("campaign_metrics").select(`
      id,
      campaign_id,
      target_email,
      sent_at,
      delivered_at,
      opened_at,
      clicked_at,
      data_submitted_at,
      reported_at,
      additional_data,
      user_agent,
      ip_address
    `);

    // Filter by campaign if specified
    if (campaignId) {
      query = query.eq("campaign_id", campaignId);
    }

    // Filter by timeframe
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeframe));
    query = query.gte("sent_at", cutoffDate.toISOString());

    const { data: metrics, error } = await query;

    if (error) {
      throw new Error(`Failed to get metrics: ${error.message}`);
    }

    // Calculate aggregated metrics
    const totalSent = metrics?.length || 0;
    const totalDelivered = metrics?.filter(m => m.delivered_at).length || 0;
    const totalOpened = metrics?.filter(m => m.opened_at).length || 0;
    const totalClicked = metrics?.filter(m => m.clicked_at).length || 0;
    const totalSubmitted = metrics?.filter(m => m.data_submitted_at).length || 0;
    const totalReported = metrics?.filter(m => m.reported_at).length || 0;

    // Calculate rates
    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
    const submitRate = totalSent > 0 ? (totalSubmitted / totalSent) * 100 : 0;
    const reportRate = totalSent > 0 ? (totalReported / totalSent) * 100 : 0;

    // Group by day for trend analysis
    const dailyMetrics = new Map();
    
    metrics?.forEach(metric => {
      if (metric.sent_at) {
        const date = new Date(metric.sent_at).toISOString().split('T')[0];
        if (!dailyMetrics.has(date)) {
          dailyMetrics.set(date, {
            date,
            sent: 0,
            opened: 0,
            clicked: 0,
            submitted: 0,
            reported: 0
          });
        }
        
        const dayData = dailyMetrics.get(date);
        dayData.sent++;
        if (metric.opened_at) dayData.opened++;
        if (metric.clicked_at) dayData.clicked++;
        if (metric.data_submitted_at) dayData.submitted++;
        if (metric.reported_at) dayData.reported++;
      }
    });

    const trends = Array.from(dailyMetrics.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Department analysis if data available
    const departmentMetrics = new Map();
    
    // Get campaign and target list data for department breakdown
    if (campaignId) {
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("target_list_id")
        .eq("id", campaignId)
        .single();

      if (campaign?.target_list_id) {
        const { data: targets } = await supabase
          .from("targets")
          .select("email, department")
          .eq("list_id", campaign.target_list_id);

        targets?.forEach(target => {
          const dept = target.department || "Unknown";
          const metric = metrics?.find(m => m.target_email === target.email);
          
          if (metric) {
            if (!departmentMetrics.has(dept)) {
              departmentMetrics.set(dept, {
                department: dept,
                sent: 0,
                opened: 0,
                clicked: 0,
                submitted: 0
              });
            }
            
            const deptData = departmentMetrics.get(dept);
            deptData.sent++;
            if (metric.opened_at) deptData.opened++;
            if (metric.clicked_at) deptData.clicked++;
            if (metric.data_submitted_at) deptData.submitted++;
          }
        });
      }
    }

    const response = {
      summary: {
        totalSent,
        totalDelivered,
        totalOpened,
        totalClicked,
        totalSubmitted,
        totalReported,
        openRate: Math.round(openRate * 100) / 100,
        clickRate: Math.round(clickRate * 100) / 100,
        submitRate: Math.round(submitRate * 100) / 100,
        reportRate: Math.round(reportRate * 100) / 100
      },
      trends,
      departmentMetrics: Array.from(departmentMetrics.values()),
      rawMetrics: metrics || []
    };

    console.log(`Retrieved metrics for ${campaignId ? `campaign ${campaignId}` : 'all campaigns'}: ${totalSent} sent, ${totalOpened} opened, ${totalClicked} clicked`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in get-campaign-metrics:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);