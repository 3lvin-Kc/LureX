
/**
 * Security event logging utility
 * Logs security events and can send them to the server for monitoring
 * Includes anomaly detection capabilities
 */

import { supabase } from "@/integrations/supabase/client";
import { nanoid } from 'nanoid';

// Event severity levels
export enum SecurityEventLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Types of security events
export enum SecurityEventType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_ACCESS = 'data_access',
  INPUT_VALIDATION = 'input_validation',
  RATE_LIMIT = 'rate_limit',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  API_ABUSE = 'api_abuse',
  XSS_ATTEMPT = 'xss_attempt',
  CSRF_ATTEMPT = 'csrf_attempt',
  SQL_INJECTION = 'sql_injection',
  BRUTE_FORCE = 'brute_force',
  SESSION_ANOMALY = 'session_anomaly'
}

export interface SecurityEvent {
  type: SecurityEventType;
  level: SecurityEventLevel;
  message: string;
  details?: any;
  timestamp?: number;
  eventId?: string;
}

// Patterns to detect potentially malicious input
const SUSPICIOUS_PATTERNS = {
  SQL_INJECTION: [
    /('|;|--|\/\*|\*\/|@@|xp_|select\s+from|union\s+select|insert\s+into|drop\s+table|alter\s+table|exec\s+xp)/i,
    /(select|update|delete|insert|drop|alter|truncate)\s+.*?(from|table)/i
  ],
  XSS: [
    /<script\b[^>]*>/i,
    /javascript:/i,
    /on(load|click|mouseover|focus|blur|error|unload|change)\s*=/i,
    /(href|src|style)\s*=\s*["']?\s*(data|javascript):/i
  ],
  PATH_TRAVERSAL: [
    /(\.\.\/|\.\.\\|~\/|~\\)/i,
    /\/etc\/passwd|\/etc\/shadow|c:\\windows\\system32/i
  ],
  COMMAND_INJECTION: [
    /;|\||&|\$\(|\`|\$\{/i
  ]
};

class SecurityLogger {
  private logToConsole: boolean;
  private logToServer: boolean;
  private enabled: boolean;
  private readonly SESSION_ID: string;
  private clientInfo: Record<string, any>;
  
  constructor() {
    this.logToConsole = true;
    this.logToServer = true;
    this.enabled = true;
    this.SESSION_ID = nanoid(12); // Generate unique session ID
    
    // Collect client environment information
    this.clientInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      sessionId: this.SESSION_ID
    };
    
    // Log session start
    this.info(
      SecurityEventType.AUTHENTICATION, 
      "Browser session started", 
      this.clientInfo
    );
    
    // Add beforeunload event to log session end
    window.addEventListener('beforeunload', () => {
      this.info(
        SecurityEventType.AUTHENTICATION, 
        "Browser session ended", 
        this.clientInfo
      );
    });
  }
  
  /**
   * Log a security event
   * @param event The security event to log
   */
  async log(event: SecurityEvent): Promise<void> {
    if (!this.enabled) return;
    
    // Add metadata to event
    const eventWithMetadata = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      eventId: event.eventId || nanoid(16),
      sessionId: this.SESSION_ID
    };
    
    // Check for anomalies in the event
    const anomalyCheck = this.detectAnomalies(eventWithMetadata);
    
    // Add anomaly information to the event
    const eventWithAnomalyCheck = {
      ...eventWithMetadata,
      isAnomalous: anomalyCheck.isAnomalous,
      anomalyReasons: anomalyCheck.reasons
    };
    
    // Log to console if enabled
    if (this.logToConsole) {
      const method = this.getConsoleMethod(event.level);
      console[method](
        `[SECURITY ${event.level.toUpperCase()}][${event.type}]${anomalyCheck.isAnomalous ? '[⚠️ ANOMALY]' : ''} ${event.message}`,
        {
          details: event.details || '',
          ...(anomalyCheck.isAnomalous ? { anomalyReasons: anomalyCheck.reasons } : {})
        }
      );
    }
    
    // Log to server if enabled and user is authenticated
    if (this.logToServer) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Only log to server if user is authenticated
          await this.logToSupabase(eventWithAnomalyCheck, session.user.id);
        } else if (anomalyCheck.isAnomalous) {
          // If not authenticated but anomaly detected, still log it
          await this.logToSupabase(eventWithAnomalyCheck);
        }
      } catch (error) {
        console.error('Failed to log security event to server:', error);
      }
    }
    
    // If critical or anomalous, trigger additional protections
    if (event.level === SecurityEventLevel.CRITICAL || anomalyCheck.isAnomalous) {
      this.triggerProtections(eventWithAnomalyCheck);
    }
  }
  
  /**
   * Log security event with INFO level
   */
  info(type: SecurityEventType, message: string, details?: any): void {
    this.log({ type, level: SecurityEventLevel.INFO, message, details });
  }
  
  /**
   * Log security event with WARNING level
   */
  warn(type: SecurityEventType, message: string, details?: any): void {
    this.log({ type, level: SecurityEventLevel.WARNING, message, details });
  }
  
  /**
   * Log security event with ERROR level
   */
  error(type: SecurityEventType, message: string, details?: any): void {
    this.log({ type, level: SecurityEventLevel.ERROR, message, details });
  }
  
  /**
   * Log security event with CRITICAL level
   */
  critical(type: SecurityEventType, message: string, details?: any): void {
    this.log({ type, level: SecurityEventLevel.CRITICAL, message, details });
  }
  
  /**
   * Enable or disable logging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
  
  /**
   * Configure logging options
   */
  configure(options: { logToConsole?: boolean; logToServer?: boolean }): void {
    if (options.logToConsole !== undefined) {
      this.logToConsole = options.logToConsole;
    }
    if (options.logToServer !== undefined) {
      this.logToServer = options.logToServer;
    }
  }

  /**
   * Validate user input for security risks
   * @param input The user input to validate
   * @param context Context information (field name, form id, etc.)
   * @returns An object with validation result and any detected issues
   */
  validateInput(input: string, context: string): { 
    safe: boolean; 
    issues: string[]; 
    securityRisks: SecurityEventType[] 
  } {
    if (!input || typeof input !== 'string') {
      return { safe: true, issues: [], securityRisks: [] };
    }
    
    const issues: string[] = [];
    const securityRisks: SecurityEventType[] = [];
    
    // Check for SQL injection patterns
    if (SUSPICIOUS_PATTERNS.SQL_INJECTION.some(pattern => pattern.test(input))) {
      issues.push("Potential SQL injection detected");
      securityRisks.push(SecurityEventType.SQL_INJECTION);
    }
    
    // Check for XSS patterns
    if (SUSPICIOUS_PATTERNS.XSS.some(pattern => pattern.test(input))) {
      issues.push("Potential XSS attack detected");
      securityRisks.push(SecurityEventType.XSS_ATTEMPT);
    }
    
    // Check for path traversal
    if (SUSPICIOUS_PATTERNS.PATH_TRAVERSAL.some(pattern => pattern.test(input))) {
      issues.push("Potential path traversal detected");
      securityRisks.push(SecurityEventType.SUSPICIOUS_ACTIVITY);
    }
    
    // Check for command injection
    if (SUSPICIOUS_PATTERNS.COMMAND_INJECTION.some(pattern => pattern.test(input))) {
      issues.push("Potential command injection detected");
      securityRisks.push(SecurityEventType.SUSPICIOUS_ACTIVITY);
    }
    
    // Log if security risks found
    if (securityRisks.length > 0) {
      this.warn(
        securityRisks[0], // Use the first risk type as the primary
        `Suspicious input detected in ${context}`,
        {
          input: input.substring(0, 100) + (input.length > 100 ? '...' : ''), // Truncate for logging
          context,
          issues
        }
      );
    }
    
    return {
      safe: issues.length === 0,
      issues,
      securityRisks
    };
  }
  
  /**
   * Get the appropriate console method for the severity level
   */
  private getConsoleMethod(level: SecurityEventLevel): 'log' | 'info' | 'warn' | 'error' {
    switch (level) {
      case SecurityEventLevel.INFO:
        return 'info';
      case SecurityEventLevel.WARNING:
        return 'warn';
      case SecurityEventLevel.ERROR:
      case SecurityEventLevel.CRITICAL:
        return 'error';
      default:
        return 'log';
    }
  }
  
  /**
   * Detect anomalies in security events
   */
  private detectAnomalies(event: SecurityEvent & { sessionId: string }): { isAnomalous: boolean, reasons: string[] } {
    const reasons: string[] = [];
    
    // Check critical level events
    if (event.level === SecurityEventLevel.CRITICAL) {
      reasons.push('Critical level security event');
    }
    
    // Check suspicious input patterns in details or message
    if (event.details) {
      const detailsStr = typeof event.details === 'string' 
        ? event.details 
        : JSON.stringify(event.details);
      
      // Check SQL injection patterns
      if (SUSPICIOUS_PATTERNS.SQL_INJECTION.some(pattern => pattern.test(detailsStr))) {
        reasons.push('Potential SQL injection pattern detected');
      }
      
      // Check XSS patterns
      if (SUSPICIOUS_PATTERNS.XSS.some(pattern => pattern.test(detailsStr))) {
        reasons.push('Potential XSS pattern detected');
      }
      
      // Check path traversal patterns
      if (SUSPICIOUS_PATTERNS.PATH_TRAVERSAL.some(pattern => pattern.test(detailsStr))) {
        reasons.push('Potential path traversal pattern detected');
      }
    }
    
    // Check message for suspicious patterns
    if (event.message) {
      // Check all pattern types against the message
      Object.entries(SUSPICIOUS_PATTERNS).forEach(([type, patterns]) => {
        if ((patterns as RegExp[]).some(pattern => pattern.test(event.message))) {
          reasons.push(`Potential ${type.replace(/_/g, ' ').toLowerCase()} pattern in message`);
        }
      });
    }
    
    // Check for multiple authentication failures
    if (event.type === SecurityEventType.AUTHENTICATION && 
        event.level === SecurityEventLevel.ERROR &&
        event.details?.failureCount > 3) {
      reasons.push(`Multiple authentication failures: ${event.details.failureCount}`);
    }
    
    // Check for brute force attempts
    if (event.type === SecurityEventType.BRUTE_FORCE) {
      reasons.push('Brute force attempt detected');
    }
    
    return {
      isAnomalous: reasons.length > 0,
      reasons
    };
  }
  
  /**
   * Trigger additional protections for critical or anomalous events
   */
  private triggerProtections(event: SecurityEvent & { isAnomalous?: boolean, anomalyReasons?: string[] }): void {
    // Log more critical events to the console regardless of console settings
    console.error('SECURITY ALERT:', {
      type: event.type,
      level: event.level,
      message: event.message,
      isAnomalous: event.isAnomalous,
      anomalyReasons: event.anomalyReasons,
      timestamp: new Date(event.timestamp || Date.now()).toISOString()
    });
    
    // Could implement additional protections like:
    // - Clearing sensitive session data
    // - Forcing re-authentication
    // - Applying stricter rate limits
    
    // For now, just store the event in sessionStorage for potential recovery
    try {
      const securityEvents = JSON.parse(sessionStorage.getItem('security_alerts') || '[]');
      securityEvents.push({
        type: event.type,
        level: event.level,
        message: event.message,
        isAnomalous: event.isAnomalous,
        timestamp: event.timestamp || Date.now()
      });
      sessionStorage.setItem('security_alerts', JSON.stringify(securityEvents.slice(-10))); // Keep last 10
    } catch (error) {
      // Silently fail if sessionStorage is not available
    }
  }
  
  /**
   * Log a security event to Supabase
   */
  private async logToSupabase(
    event: SecurityEvent & { 
      sessionId: string; 
      isAnomalous?: boolean; 
      anomalyReasons?: string[] 
    }, 
    userId?: string
  ): Promise<void> {
    try {
      // Get client information
      const clientInfo = {
        userAgent: navigator.userAgent,
        location: window.location.href,
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
        sessionId: this.SESSION_ID
      };
      
      // First log the security event
      await supabase.from('security_logs').insert({
        user_id: userId,
        event_type: event.type,
        event_level: event.level,
        message: event.message,
        details: event.details,
        user_agent: clientInfo.userAgent,
        location: clientInfo.location,
        ip_address: null, // IP will be captured by the server
        is_anomalous: event.isAnomalous || false,
        created_at: new Date().toISOString()
      } as any); // Type assertion to bypass TypeScript error
      
      // If this is an anomaly, also log to the anomalies table
      if (event.isAnomalous && event.anomalyReasons && event.anomalyReasons.length > 0) {
        await supabase.from('security_anomalies').insert({
          user_id: userId,
          event_data: {
            type: event.type,
            level: event.level,
            message: event.message,
            details: event.details,
            sessionId: event.sessionId
          },
          reasons: event.anomalyReasons,
          user_agent: clientInfo.userAgent,
          location: clientInfo.location,
          detected_at: new Date().toISOString()
        } as any); // Type assertion to bypass TypeScript error
      }
    } catch (error) {
      console.error('Failed to send security log to Supabase:', error);
      
      // As a fallback, we can also use the security-log edge function
      try {
        await supabase.functions.invoke('security-log', {
          body: {
            event: {
              type: event.type,
              level: event.level,
              message: event.message,
              details: event.details,
              sessionId: event.sessionId,
              isAnomalous: event.isAnomalous,
              anomalyReasons: event.anomalyReasons
            },
            userId,
            userAgent: navigator.userAgent,
            location: window.location.href
          }
        });
      } catch (fallbackError) {
        console.error('Failed to send security log via edge function:', fallbackError);
      }
    }
  }
}

// Export singleton instance
export const securityLogger = new SecurityLogger();

// Helper to sanitize user input
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // First check for obvious attack patterns
  const inputValidation = securityLogger.validateInput(input, 'sanitizer');
  if (!inputValidation.safe) {
    securityLogger.warn(
      SecurityEventType.INPUT_VALIDATION,
      "Potentially malicious input sanitized",
      { input: input.slice(0, 100), issues: inputValidation.issues }
    );
  }
  
  // Basic sanitization to prevent XSS
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;');
};
