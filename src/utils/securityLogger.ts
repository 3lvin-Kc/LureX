
/**
 * Security event logging utility
 * Logs security events and can send them to the server for monitoring
 */

import { supabase } from "@/integrations/supabase/client";

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
  API_ABUSE = 'api_abuse'
}

export interface SecurityEvent {
  type: SecurityEventType;
  level: SecurityEventLevel;
  message: string;
  details?: any;
  timestamp?: number;
}

class SecurityLogger {
  private logToConsole: boolean;
  private logToServer: boolean;
  private enabled: boolean;
  
  constructor() {
    this.logToConsole = true;
    this.logToServer = true;
    this.enabled = true;
  }
  
  /**
   * Log a security event
   * @param event The security event to log
   */
  async log(event: SecurityEvent): Promise<void> {
    if (!this.enabled) return;
    
    // Add timestamp if not provided
    const eventWithTimestamp = {
      ...event,
      timestamp: event.timestamp || Date.now()
    };
    
    // Log to console if enabled
    if (this.logToConsole) {
      const method = this.getConsoleMethod(event.level);
      console[method](
        `[SECURITY ${event.level.toUpperCase()}][${event.type}] ${event.message}`,
        event.details || ''
      );
    }
    
    // Log to server if enabled and user is authenticated
    if (this.logToServer) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Only log to server if user is authenticated
          await this.logToSupabase(eventWithTimestamp, session.user.id);
        }
      } catch (error) {
        console.error('Failed to log security event to server:', error);
      }
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
   * Log a security event to Supabase (if available)
   * This will be stored in Supabase logs for monitoring
   */
  private async logToSupabase(event: SecurityEvent, userId: string): Promise<void> {
    try {
      // Using the built-in edge function for logging
      await supabase.functions.invoke('security-log', {
        body: {
          event,
          userId,
          userAgent: navigator.userAgent,
          location: window.location.href
        }
      });
    } catch (error) {
      console.error('Failed to send security log to Supabase:', error);
    }
  }
}

// Export singleton instance
export const securityLogger = new SecurityLogger();
