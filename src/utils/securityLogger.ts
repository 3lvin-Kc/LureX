
import { supabase } from "@/integrations/supabase/client";
import { nanoid } from "nanoid";

export enum SecurityEventType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_ACCESS = 'data_access',
  CONFIG_CHANGE = 'config_change',
  USER_MANAGEMENT = 'user_management',
  RATE_LIMIT = 'rate_limit',
  API_ACCESS = 'api_access',
  CONTENT_MUTATION = 'content_mutation',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  API_ABUSE = 'api_abuse',
  INPUT_VALIDATION = 'input_validation'
}

export enum SecurityEventLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

interface SecurityLogEvent {
  id: string;
  timestamp: string;
  eventType: SecurityEventType;
  level: SecurityEventLevel;
  message: string;
  details?: any;
  userId?: string;
  userAgent?: string;
  ipAddress?: string;
  location?: string;
  isAnomalous: boolean;
}

interface InputValidationResult {
  safe: boolean;
  issues?: string[];
  sanitized?: string;
}

/**
 * Security Logger for tracking security events and anomalies
 */
export class SecurityLogger {
  private static instance: SecurityLogger;
  private queue: SecurityLogEvent[] = [];
  private processing: boolean = false;
  private anomalyDetectionEnabled: boolean = true;
  
  private constructor() {
    // Process queued events every 5 seconds
    setInterval(() => this.processQueue(), 5000);
  }
  
  public static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }
  
  /**
   * Log an informational security event
   */
  public info(
    eventType: SecurityEventType,
    message: string,
    details?: any
  ): void {
    this.log(SecurityEventLevel.INFO, eventType, message, details);
  }
  
  /**
   * Log a warning security event
   */
  public warn(
    eventType: SecurityEventType,
    message: string,
    details?: any
  ): void {
    this.log(SecurityEventLevel.WARN, eventType, message, details);
  }
  
  /**
   * Log an error security event
   */
  public error(
    eventType: SecurityEventType,
    message: string,
    details?: any
  ): void {
    this.log(SecurityEventLevel.ERROR, eventType, message, details);
  }
  
  /**
   * Log a critical security event
   */
  public critical(
    eventType: SecurityEventType,
    message: string,
    details?: any
  ): void {
    this.log(SecurityEventLevel.CRITICAL, eventType, message, details);
  }
  
  /**
   * Log a security event
   */
  public log(
    level: SecurityEventLevel,
    eventType: SecurityEventType,
    message: string,
    details?: any
  ): void {
    const event = this.createLogEvent(level, eventType, message, details);
    
    // Add to processing queue
    this.queue.push(event);
    
    // Log to console as well
    this.logToConsole(event);
    
    // Process immediately for critical events, otherwise process in batch
    if (level === SecurityEventLevel.CRITICAL) {
      this.processQueue();
    }
  }
  
  /**
   * Create a log event object
   */
  private createLogEvent(
    level: SecurityEventLevel,
    eventType: SecurityEventType,
    message: string,
    details?: any
  ): SecurityLogEvent {
    // Get browser information
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : 'server';
    
    // Default isAnomalous to false, anomaly detection happens during processing
    const isAnomalous = false;
    
    // Create the log event
    return {
      id: nanoid(),
      timestamp: new Date().toISOString(),
      eventType,
      level,
      message,
      details,
      userAgent,
      isAnomalous
    };
  }
  
  /**
   * Process the queue of log events
   */
  private async processQueue(): Promise<void> {
    // Prevent concurrent processing
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    try {
      // Get events to process in this batch (copy and clear queue)
      const events = [...this.queue];
      this.queue = [];
      
      // Process each event
      for (const event of events) {
        // Check if the event is anomalous
        if (this.anomalyDetectionEnabled) {
          event.isAnomalous = await this.detectAnomaly(event);
        }
        
        // Save the log to the database
        await this.saveLog(event);
        
        // Handle anomalous events
        if (event.isAnomalous) {
          await this.handleAnomaly(event);
        }
      }
    } catch (error) {
      console.error('Error processing security logs:', error);
    } finally {
      this.processing = false;
    }
  }
  
  /**
   * Save a log entry to the database
   */
  private async saveLog(event: SecurityLogEvent): Promise<void> {
    try {
      const { error } = await supabase
        .from("security_logs" as any)
        .insert({
          user_id: event.userId,
          event_type: event.eventType,
          event_level: event.level,
          message: event.message,
          details: event.details,
          user_agent: event.userAgent,
          location: event.location,
          ip_address: event.ipAddress,
          is_anomalous: event.isAnomalous
        } as any);
      
      if (error) {
        console.error('Error saving security log:', error);
      }
    } catch (error) {
      console.error('Error saving security log:', error);
    }
  }
  
  /**
   * Handle an anomalous security event
   */
  private async handleAnomaly(event: SecurityLogEvent): Promise<void> {
    try {
      // Save to security anomalies table
      const { error } = await supabase
        .from("security_anomalies" as any)
        .insert({
          user_id: event.userId,
          event_data: event,
          reasons: ['Suspicious activity detected'],
          user_agent: event.userAgent,
          location: event.location,
          ip_address: event.ipAddress
        } as any);
      
      if (error) {
        console.error('Error saving security anomaly:', error);
      }
      
      // Additional anomaly handling can be added here
    } catch (error) {
      console.error('Error handling security anomaly:', error);
    }
  }
  
  /**
   * Detect if an event is anomalous
   * Simple implementation for now, can be expanded later
   */
  private async detectAnomaly(_event: SecurityLogEvent): Promise<boolean> {
    // Simplified anomaly detection logic
    // In a real system, this would use more sophisticated detection
    return false;
  }
  
  /**
   * Log to console for development visibility
   */
  private logToConsole(event: SecurityLogEvent): void {
    const { level, eventType, message } = event;
    const timestamp = new Date(event.timestamp).toLocaleTimeString();
    
    const style = {
      info: 'color: #4299E1; font-weight: bold;',
      warn: 'color: #ECC94B; font-weight: bold;',
      error: 'color: #F56565; font-weight: bold;',
      critical: 'color: #FFFFFF; background: #E53E3E; font-weight: bold; padding: 2px 4px;'
    };
    
    console.log(
      `%c${timestamp} [${level.toUpperCase()}] [${eventType}]%c ${message}`,
      style[level as keyof typeof style],
      'color: inherit'
    );
    
    if (event.details) {
      console.log('Details:', event.details);
    }
  }
  
  /**
   * Enable or disable anomaly detection
   */
  public setAnomalyDetection(enabled: boolean): void {
    this.anomalyDetectionEnabled = enabled;
  }

  /**
   * Validate input for security issues
   * @param input The input string to validate
   * @param context The context where this input is used (for logging)
   * @returns Result indicating if the input is safe and any issues found
   */
  public validateInput(input: string, context: string): InputValidationResult {
    if (!input) {
      return { safe: true, sanitized: "" };
    }

    const issues: string[] = [];
    
    // Check for potential XSS payloads
    if (/<script|javascript:|on\w+\s*=|alert\s*\(|eval\s*\(|document\.cookie|iframe/i.test(input)) {
      issues.push('Potentially malicious script content');
    }
    
    // Check for SQL injection attempts
    if (/(\b(select|insert|update|delete|from|where|drop|alter|exec|union|--)\b)|('--)/i.test(input)) {
      issues.push('Potential SQL injection pattern');
    }
    
    // Check for very long inputs (potential DoS)
    if (input.length > 1000) {
      issues.push('Input exceeds maximum allowed length');
    }

    const sanitized = this.sanitizeInput(input);
    
    return {
      safe: issues.length === 0,
      issues: issues.length > 0 ? issues : undefined,
      sanitized
    };
  }
}

/**
 * Sanitize input to prevent XSS attacks
 * @param input The input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";
  
  // Basic HTML entity encoding
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const securityLogger = SecurityLogger.getInstance();
