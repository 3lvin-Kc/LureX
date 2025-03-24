
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Security-Policy": "default-src 'self'; img-src 'self' https: data:; object-src 'none'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
};

// Rate limiting implementation with Redis-style expiration
const RATE_LIMIT = 10; // logs per window
const RATE_WINDOW = 60000; // 1 minute in milliseconds
const ipRequests: Record<string, { count: number, timestamp: number }> = {};

// Clean up old rate limit entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  Object.keys(ipRequests).forEach(ip => {
    if (now - ipRequests[ip].timestamp > RATE_WINDOW) {
      delete ipRequests[ip];
    }
  });
}, 300000); // 5 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  
  if (!ipRequests[ip] || (now - ipRequests[ip].timestamp) > RATE_WINDOW) {
    ipRequests[ip] = { count: 1, timestamp: now };
    return true;
  }
  
  if (ipRequests[ip].count >= RATE_LIMIT) {
    return false;
  }
  
  ipRequests[ip].count++;
  return true;
}

// Anomaly detection thresholds and patterns
const SUSPICIOUS_PATTERNS = [
  /^(SELECT|INSERT|UPDATE|DELETE|DROP)/i, // SQL-like commands
  /<script>|javascript:|on(load|click|mouseover)=/i, // Basic XSS attempt
  /(\.\.|\/var\/www|\etc\/passwd)/i,     // Path traversal
  /;|\||&|\$\(|\`|\$\{/i                // Command injection
];

function detectAnomalies(logData: any): { isAnomalous: boolean, reasons: string[] } {
  const reasons: string[] = [];
  
  // Check if it's already marked as anomalous
  if (logData.event?.isAnomalous) {
    reasons.push('Client-side anomaly detection triggered');
    if (logData.event?.anomalyReasons) {
      reasons.push(...logData.event.anomalyReasons);
    }
    return { isAnomalous: true, reasons };
  }
  
  // Check for suspicious patterns in the event details or message
  if (logData.event?.details) {
    const detailsStr = typeof logData.event.details === 'string' 
      ? logData.event.details 
      : JSON.stringify(logData.event.details);
    
    SUSPICIOUS_PATTERNS.forEach((pattern, index) => {
      if (pattern.test(detailsStr)) {
        reasons.push(`Suspicious pattern #${index+1} detected in details`);
      }
    });
  }
  
  if (logData.event?.message) {
    SUSPICIOUS_PATTERNS.forEach((pattern, index) => {
      if (pattern.test(logData.event.message)) {
        reasons.push(`Suspicious pattern #${index+1} detected in message`);
      }
    });
  }
  
  // Check for critical level events
  if (logData.event?.level === 'critical') {
    reasons.push('Critical level event');
  }
  
  // Check for repeated failed authentication
  if (logData.event?.type === 'authentication' && 
      logData.event?.level === 'error' &&
      logData.event?.details?.failureCount > 3) {
    reasons.push(`Multiple authentication failures: ${logData.event.details.failureCount}`);
  }
  
  // Check for rapid succession of events (potential automated attack)
  if (logData.event?.sessionId && logData.previousEvents) {
    const sessionEvents = logData.previousEvents.filter(
      (e: any) => e.sessionId === logData.event.sessionId
    );
    
    // If more than 20 events in less than 10 seconds from the same session
    if (sessionEvents.length > 20) {
      const timestamps = sessionEvents.map((e: any) => new Date(e.timestamp).getTime());
      const timeRange = Math.max(...timestamps) - Math.min(...timestamps);
      if (timeRange < 10000) { // 10 seconds
        reasons.push(`High event velocity: ${sessionEvents.length} events in ${timeRange/1000}s`);
      }
    }
  }
  
  // IP address anomaly detection
  if (logData.ipReputation && logData.ipReputation.score > 80) {
    reasons.push(`Suspicious IP reputation score: ${logData.ipReputation.score}`);
  }
  
  return {
    isAnomalous: reasons.length > 0,
    reasons
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";
    
    // Check rate limit
    if (!checkRateLimit(clientIp)) {
      console.error(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ success: false, error: "Rate limit exceeded" }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client with admin privileges
    const supa = createClient(supabaseUrl, supabaseServiceKey);

    // Parse and validate request body
    const logData = await req.json();
    const { event, userId, userAgent, location } = logData;
    
    if (!event) {
      throw new Error("Missing required event field");
    }
    
    // Get recent events for the same session if available
    let previousEvents = [];
    if (event.sessionId) {
      try {
        const { data: recentEvents } = await supa
          .from('security_logs')
          .select('*')
          .eq('details->sessionId', event.sessionId)
          .order('created_at', { ascending: false })
          .limit(30);
          
        if (recentEvents) {
          previousEvents = recentEvents;
        }
      } catch (e) {
        console.error("Error fetching previous events:", e);
      }
    }
    
    // Add previous events to the log data for anomaly detection
    const enrichedLogData = {
      ...logData,
      previousEvents
    };
    
    // Check for anomalies
    const anomalyCheck = detectAnomalies(enrichedLogData);
    if (anomalyCheck.isAnomalous) {
      console.warn("Anomaly detected:", {
        reasons: anomalyCheck.reasons,
        logData: {
          event_type: event.type,
          event_level: event.level,
          message: event.message
        }
      });
      
      // Store anomaly in database for monitoring
      await supa.from('security_anomalies').insert({
        user_id: userId,
        event_data: event,
        reasons: anomalyCheck.reasons,
        user_agent: userAgent,
        location,
        ip_address: clientIp,
        detected_at: new Date().toISOString()
      });
    }
    
    // Store the log
    const timestamp = new Date().toISOString();
    const logEntry = {
      user_id: userId,
      event_type: event.type,
      event_level: event.level,
      message: event.message,
      details: event.details,
      user_agent: userAgent,
      location,
      ip_address: clientIp,
      created_at: timestamp,
      is_anomalous: anomalyCheck.isAnomalous
    };
    
    await supa.from('security_logs').insert(logEntry);
    
    return new Response(
      JSON.stringify({ success: true, timestamp, anomaly: anomalyCheck.isAnomalous ? anomalyCheck.reasons : null }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in security-log function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
