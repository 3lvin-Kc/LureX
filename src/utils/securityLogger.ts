export enum SecurityEventType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization', 
  DATA_ACCESS = 'data_access',
  INPUT_VALIDATION = 'input_validation',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  SYSTEM_ERROR = 'system_error',
  API_ACCESS = 'api_access',
  RATE_LIMIT = 'rate_limit',
  PHISHING_PAGE_ACCESS = 'phishing_page_access'
}

interface SecurityEvent {
  type: SecurityEventType;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  
  private log(level: 'info' | 'warn' | 'error', type: SecurityEventType, message: string, details?: Record<string, any>) {
    const event: SecurityEvent = {
      type,
      message,
      details,
      timestamp: new Date().toISOString(),
      level
    };
    
    this.events.push(event);
    console.log(`[SECURITY ${level.toUpperCase()}]`, event);
  }
  
  info(type: SecurityEventType, message: string, details?: Record<string, any>) {
    this.log('info', type, message, details);
  }
  
  warn(type: SecurityEventType, message: string, details?: Record<string, any>) {
    this.log('warn', type, message, details);
  }
  
  error(type: SecurityEventType, message: string, details?: Record<string, any>) {
    this.log('error', type, message, details);
  }
  
  getEvents(): SecurityEvent[] {
    return [...this.events];
  }
  
  clearEvents() {
    this.events = [];
  }
  
  // Input validation helper
  validateInput(input: string, context: string): { safe: boolean; reason?: string; issues?: string[] } {
    const issues: string[] = [];
    
    // Check for potential XSS
    if (/<script|javascript:|on\w+=/i.test(input)) {
      issues.push('Potential XSS detected');
    }
    
    // Check for SQL injection patterns
    if (/('|(\\');?(\s)*(union|select|insert|update|delete|drop|create|alter))/i.test(input)) {
      issues.push('Potential SQL injection detected');
    }
    
    // Check for excessive length
    if (input.length > 10000) {
      issues.push('Input exceeds maximum length');
    }
    
    const safe = issues.length === 0;
    
    return {
      safe,
      reason: safe ? undefined : `Input validation failed for ${context}`,
      issues: issues.length > 0 ? issues : undefined
    };
  }
}

export const securityLogger = new SecurityLogger();
