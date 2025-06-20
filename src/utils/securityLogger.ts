
/**
 * Mock security logger for frontend-only implementation
 * Contains functions to maintain compatibility with existing code
 */

export enum SecurityEventType {
  LOGIN_ATTEMPT = 'login_attempt',
  PHISHING_PAGE_ACCESS = 'phishing_page_access',
  DATA_ACCESS = 'data_access',
  API_ACCESS = 'api_access',
  RATE_LIMIT = 'rate_limit',
  AUTHORIZATION = 'authorization',
  DATA_MODIFICATION = 'data_modification',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  INPUT_VALIDATION = 'input_validation',
  AUTHENTICATION = 'authentication'
}

// Add SecurityEventLevel for compatibility
export enum SecurityEventLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

interface SecurityEvent {
  type: SecurityEventType;
  message: string;
  metadata?: Record<string, any>;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
}

export class SecurityLogger {
  private static instance: SecurityLogger;
  
  private constructor() {}
  
  public static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }
  
  public info(type: SecurityEventType, message: string, metadata?: Record<string, any>): void {
    this.log('info', type, message, metadata);
  }
  
  public warn(type: SecurityEventType, message: string, metadata?: Record<string, any>): void {
    this.log('warn', type, message, metadata);
  }
  
  public error(type: SecurityEventType, message: string, metadata?: Record<string, any>): void {
    this.log('error', type, message, metadata);
  }
  
  private log(level: 'info' | 'warn' | 'error', type: SecurityEventType, message: string, metadata?: Record<string, any>): void {
    const event: SecurityEvent = {
      type,
      message,
      metadata,
      timestamp: new Date().toISOString(),
      level
    };
    
    // Mock implementation - just log to console
    console.log(`[Security ${level.toUpperCase()}]`, event);
  }
  
  public validateInput(input: string, context: string): { safe: boolean; reason?: string; issues?: string[] } {
    // Mock validation - just check for obvious issues
    const issues: string[] = [];
    
    if (input.includes('<script>')) {
      issues.push('Script tag detected');
    }
    if (input.includes('javascript:')) {
      issues.push('JavaScript protocol detected');
    }
    if (input.includes('onload=') || input.includes('onerror=')) {
      issues.push('Event handler detected');
    }
    
    if (issues.length > 0) {
      return { 
        safe: false, 
        reason: 'Potentially malicious content detected',
        issues 
      };
    }
    
    return { safe: true };
  }
}

export const securityLogger = SecurityLogger.getInstance();

// Helper function to sanitize input
export function sanitizeInput(input: string): string {
  return input.replace(/[<>\"']/g, '');
}
