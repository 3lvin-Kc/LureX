
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Define log levels
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Define log types
enum LogType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_ACCESS = 'data_access',
  SYSTEM = 'system',
  AUDIT = 'audit',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  USER_ACTIVITY = 'user_activity'
}

interface LogEntry {
  level: LogLevel;
  type: LogType;
  message: string;
  metadata?: any;
  userId?: string;
  timestamp?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Extract request info
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";
    
    const { logEntry } = await req.json() as { logEntry: LogEntry };
    
    if (!logEntry || !logEntry.level || !logEntry.type || !logEntry.message) {
      throw new Error("Missing required log fields");
    }
    
    // Set timestamp if not provided
    if (!logEntry.timestamp) {
      logEntry.timestamp = new Date().toISOString();
    }
    
    // Add request context if not provided
    if (!logEntry.ipAddress) {
      logEntry.ipAddress = clientIp;
    }
    
    if (!logEntry.userAgent) {
      logEntry.userAgent = userAgent;
    }
    
    // Generate a secure hash of the log entry for immutability verification
    const logEntryString = JSON.stringify({
      level: logEntry.level,
      type: logEntry.type,
      message: logEntry.message,
      metadata: logEntry.metadata,
      userId: logEntry.userId,
      timestamp: logEntry.timestamp,
      sessionId: logEntry.sessionId,
      ipAddress: logEntry.ipAddress,
      userAgent: logEntry.userAgent
    });
    
    // Create secure hash
    const encoder = new TextEncoder();
    const data = encoder.encode(logEntryString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Insert into immutable_logs table
    const { data: insertedLog, error } = await supabase
      .from("immutable_logs")
      .insert({
        log_level: logEntry.level,
        log_type: logEntry.type,
        message: logEntry.message,
        metadata: logEntry.metadata,
        user_id: logEntry.userId,
        timestamp: logEntry.timestamp,
        session_id: logEntry.sessionId,
        ip_address: logEntry.ipAddress,
        user_agent: logEntry.userAgent,
        hash: hashHex
      })
      .select();
    
    if (error) {
      throw error;
    }
    
    // Return success with the log ID and hash
    return new Response(
      JSON.stringify({ 
        success: true, 
        logId: insertedLog[0].id,
        hash: hashHex,
        timestamp: logEntry.timestamp
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in immutable-log function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
