
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

/**
 * Enum representing different types of security events that can be logged.
 */
export enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET_SUCCESS = 'password_reset_success',
  USER_CREATION = 'user_creation',
  USER_DELETION = 'user_deletion',
  PERMISSION_CHANGE = 'permission_change',
  API_ACCESS = 'api_access',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  DATA_EXPORT = 'data_export',
  CONFIGURATION_CHANGE = 'configuration_change',
  EMAIL_SEND_ATTEMPT = 'email_send_attempt',
  PHISHING_PAGE_ACCESS = 'phishing_page_access',
  CAMPAIGN_CREATION = 'campaign_creation',
  CAMPAIGN_MODIFICATION = 'campaign_modification',
  TEMPLATE_ACCESS = 'template_access',
  TEMPLATE_CREATION = 'template_creation',
  TEMPLATE_MODIFICATION = 'template_modification',
  INPUT_VALIDATION_FAILURE = 'input_validation_failure',
  ADMIN_ACTION = 'admin_action',
  DATA_ACCESS = 'data_access',
  RATE_LIMIT = 'rate_limit',
  AUTHORIZATION = 'authorization',
  INPUT_VALIDATION = 'input_validation',
  AUTHENTICATION = 'authentication'
}

/**
 * Represents different severity levels for security logs.
 */
export enum SecurityEventLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Interface for a security event log entry.
 */
interface SecurityLogEntry {
  event_type: SecurityEventType;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, unknown>;
  event_level: string;
  message: string;
  created_at?: string;
  is_anomalous?: boolean;
  location?: string;
  [key: string]: unknown;
}

/**
 * Interface for input validation result.
 */
interface IValidationResult {
  safe: boolean;
  issues?: string[];
}

/**
 * Service for logging security events and detecting suspicious activity.
 */
export class SecurityLogger {
  private static instance: SecurityLogger;
  private client;
  private suspiciousActivityThreshold: number = 5;
  private suspiciousActivityTimeframe: number = 60 * 60 * 1000; // 1 hour in milliseconds
  private suspiciousActivities: Map<string, { count: number, firstOccurrence: number }> = new Map();

  private constructor() {
    this.client = supabase;
  }

  /**
   * Gets the singleton instance of the SecurityLogger.
   */
  public static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  /**
   * Log an informational security event.
   */
  public info(
    eventType: SecurityEventType,
    message: string,
    details?: Record<string, unknown>
  ): void {
    this.logSecurityEvent({
      event_type: eventType,
      details: { ...details, message },
      event_level: 'info',
      message: message,
      status: 'info'
    });
  }

  /**
   * Log a warning security event.
   */
  public warn(
    eventType: SecurityEventType,
    message: string,
    details?: Record<string, unknown>
  ): void {
    this.logSecurityEvent({
      event_type: eventType,
      details: { ...details, message },
      event_level: 'warning',
      message: message,
      status: 'warning'
    });
  }

  /**
   * Log an error security event.
   */
  public error(
    eventType: SecurityEventType,
    message: string,
    details?: Record<string, unknown>
  ): void {
    this.logSecurityEvent({
      event_type: eventType,
      details: { ...details, message },
      event_level: 'error',
      message: message,
      status: 'failure'
    });
  }

  /**
   * Log a critical security event.
   */
  public critical(
    eventType: SecurityEventType,
    message: string,
    details?: Record<string, unknown>
  ): void {
    this.logSecurityEvent({
      event_type: eventType,
      details: { ...details, message },
      event_level: 'critical',
      message: message,
      status: 'failure'
    });
  }

  /**
   * Logs a security event to the database.
   * @param event The security event to log.
   */
  public async logSecurityEvent(event: SecurityLogEntry): Promise<void> {
    try {
      // Add timestamp if not provided
      if (!event.created_at) {
        event.created_at = new Date().toISOString();
      }

      // Prepare the record for insertion
      const record: Record<string, unknown> = {
        event_type: event.event_type,
        event_level: event.event_level,
        message: event.message,
        details: event.details,
        created_at: event.created_at,
        user_id: event.user_id,
        user_agent: event.user_agent,
        ip_address: event.ip_address,
        is_anomalous: event.is_anomalous || false,
        location: event.location
      };

      // Log to database
      const { error } = await this.client
        .from('security_logs')
        .insert(record);

      if (error) {
        console.error('Failed to log security event:', error);
        
        // Fallback to local storage if database logging fails
        this.logToLocalStorage(event);
      }

      // Check for suspicious activity patterns
      if (event.user_id) {
        this.checkForSuspiciousActivity(event.user_id, event.event_type);
      }
    } catch (error) {
      console.error('Error in security logging:', error);
      this.logToLocalStorage(event);
    }
  }

  /**
   * Fallback method to log security events to local storage if database logging fails.
   * @param event The security event to log.
   */
  private logToLocalStorage(event: SecurityLogEntry): void {
    try {
      const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      logs.push({...event, logged_at: new Date().toISOString()});
      localStorage.setItem('security_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to log to local storage:', error);
    }
  }

  /**
   * Checks for suspicious activity patterns based on frequency of events.
   * @param userId The user ID to check for suspicious activity.
   * @param eventType The type of event that occurred.
   */
  private checkForSuspiciousActivity(userId: string, eventType: SecurityEventType): void {
    const key = `${userId}:${eventType}`;
    const now = Date.now();
    const activity = this.suspiciousActivities.get(key);

    if (activity) {
      activity.count++;
      
      // Check if the activity exceeds the threshold within the timeframe
      if (activity.count >= this.suspiciousActivityThreshold && 
          now - activity.firstOccurrence < this.suspiciousActivityTimeframe) {
        
        // Log suspicious activity
        this.logSecurityEvent({
          event_type: SecurityEventType.SUSPICIOUS_ACTIVITY,
          user_id: userId,
          details: {
            related_event_type: eventType,
            occurrence_count: activity.count,
            timeframe_ms: now - activity.firstOccurrence
          },
          event_level: 'high',
          message: 'Suspicious activity detected',
          status: 'warning'
        });

        // Reset the counter
        this.suspiciousActivities.set(key, { count: 0, firstOccurrence: now });
      }
      
      // Reset counter if outside the timeframe
      if (now - activity.firstOccurrence >= this.suspiciousActivityTimeframe) {
        this.suspiciousActivities.set(key, { count: 1, firstOccurrence: now });
      }
    } else {
      // First occurrence of this activity for this user
      this.suspiciousActivities.set(key, { count: 1, firstOccurrence: now });
    }
  }

  /**
   * Gets recent security events for a specific user.
   * @param userId The user ID to get events for.
   * @param limit The maximum number of events to retrieve.
   */
  public async getUserSecurityEvents(userId: string, limit: number = 50): Promise<SecurityLogEntry[]> {
    try {
      const { data, error } = await this.client
        .from('security_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to retrieve security events:', error);
        return [];
      }

      return data as SecurityLogEntry[];
    } catch (error) {
      console.error('Error retrieving security events:', error);
      return [];
    }
  }

  /**
   * Gets security events of a specific type.
   * @param eventType The type of events to retrieve.
   * @param limit The maximum number of events to retrieve.
   */
  public async getEventsByType(eventType: SecurityEventType, limit: number = 50): Promise<SecurityLogEntry[]> {
    try {
      const { data, error } = await this.client
        .from('security_logs')
        .select('*')
        .eq('event_type', eventType)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to retrieve security events by type:', error);
        return [];
      }

      return data as SecurityLogEntry[];
    } catch (error) {
      console.error('Error retrieving security events by type:', error);
      return [];
    }
  }

  /**
   * Sets the threshold for detecting suspicious activity.
   * @param count The number of events that triggers a suspicious activity detection.
   * @param timeframeMs The timeframe in milliseconds within which the events must occur.
   */
  public setSuspiciousActivityThreshold(count: number, timeframeMs: number): void {
    this.suspiciousActivityThreshold = count;
    this.suspiciousActivityTimeframe = timeframeMs;
  }

  /**
   * Sanitizes user input to prevent injection attacks.
   * @param input The input string to sanitize.
   * @returns The sanitized input string.
   */
  public sanitizeInput(input: string): string {
    if (!input) return '';
    
    // Basic sanitization to prevent common injection attacks
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/\\/g, '&#x5C;')
      .replace(/`/g, '&#x60;');
  }

  /**
   * Validates user input according to specified constraints.
   * @param input The input to validate.
   * @param validationType Optional string identifier for validation type.
   * @param pattern Optional regex pattern to test against.
   * @param maxLength Optional maximum allowed length.
   * @returns ValidationResult object with safe flag and potential issues.
   */
  public validateInput(
    input: string, 
    validationType?: string, 
    pattern?: RegExp, 
    maxLength?: number
  ): IValidationResult {
    const issues: string[] = [];
    
    if (input === undefined || input === null) {
      return { safe: false, issues: ['Input is null or undefined'] };
    }
    
    if (maxLength && input.length > maxLength) {
      issues.push(`Input exceeds maximum length of ${maxLength}`);
    }
    
    if (pattern && !pattern.test(input)) {
      issues.push(`Input fails pattern validation`);
    }
    
    // Additional checks based on validation type
    if (validationType === 'campaign_name') {
      // Check for potentially dangerous characters in campaign names
      if (/[<>{}()[\]\\\/]/.test(input)) {
        issues.push('Campaign name contains potentially unsafe characters');
      }
    } else if (validationType === 'campaign_description') {
      // Check for potentially dangerous content in descriptions
      if (/<script|javascript:|on\w+=/i.test(input)) {
        issues.push('Description contains potentially unsafe script content');
      }
    }
    
    return { 
      safe: issues.length === 0,
      issues: issues.length > 0 ? issues : undefined
    };
  }
}

// Export a singleton instance for use throughout the application
export const securityLogger = SecurityLogger.getInstance();

// Export the SecurityLogEntry interface for use in other files
export type { SecurityLogEntry, IValidationResult as ValidationResult };

// Export the sanitizeInput function for use in other files
export const sanitizeInput = (input: string): string => {
  return securityLogger.sanitizeInput(input);
};
