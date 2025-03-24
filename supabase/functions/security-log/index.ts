
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

// Rate limiting implementation
const RATE_LIMIT = 10; // logs per window
const RATE_WINDOW = 60000; // 1 minute in milliseconds
const ipRequests: Record<string, { count: number, timestamp: number }> = {};

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
  /<script>/i,                           // Basic XSS attempt
  /(\.\.|\/var\/www|\etc\/passwd)/i,     // Path traversal
];

function detectAnomalies(logData: any): { isAnomalous: boolean, reasons: string[] } {
  const reasons: string[] = [];
  
  // Check for suspicious patterns in the event details or message
  if (logData.event?.details) {
    const detailsStr = typeof logData.event.details === 'string' 
      ? logData.event.details 
      : JSON.stringify(logData.event.details);
    
    SUSPICIOUS_PATTERNS.forEach(pattern => {
      if (pattern.test(detailsStr)) {
        reasons.push(`Suspicious pattern detected: ${pattern}`);
      }
    });
  }
  
  if (logData.event?.message) {
    SUSPICIOUS_PATTERNS.forEach(pattern => {
      if (pattern.test(logData.event.message)) {
        reasons.push(`Suspicious pattern in message: ${pattern}`);
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
    
    if (!event || !userId) {
      throw new Error("Missing required fields");
    }
    
    // Check for anomalies
    const anomalyCheck = detectAnomalies(logData);
    if (anomalyCheck.isAnomalous) {
      console.warn("Anomaly detected:", {
        reasons: anomalyCheck.reasons,
        logData
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
      JSON.stringify({ success: true, timestamp }),
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
