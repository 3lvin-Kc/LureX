
/**
 * Client-side rate limiter utility to prevent API abuse
 */

import { securityLogger, SecurityEventType } from "./securityLogger";

interface RateLimitOptions {
  maxRequests: number;    // Maximum number of requests allowed
  timeWindow: number;     // Time window in milliseconds
  storageKey?: string;    // Key to use for localStorage
  blockDuration?: number; // Duration to block in ms (defaults to 2x timeWindow)
  securityEventType?: SecurityEventType; // Type of security event to log when limit exceeded
}

interface RateLimitState {
  requests: number[];     // Timestamps of requests
  blockedUntil?: number;  // Timestamp until which requests are blocked
  violations?: number;    // Count of rate limit violations
}

export class RateLimiter {
  private options: RateLimitOptions;
  private state: RateLimitState;
  
  constructor(options: RateLimitOptions) {
    this.options = {
      maxRequests: 60,
      timeWindow: 60000, // 1 minute
      storageKey: 'app_rate_limit',
      blockDuration: options.timeWindow ? options.timeWindow * 2 : 120000, // 2x timeWindow by default
      ...options
    };
    
    // Initialize state from localStorage if available
    try {
      const stored = localStorage.getItem(this.options.storageKey || '');
      this.state = stored ? JSON.parse(stored) : { requests: [], violations: 0 };
    } catch (error) {
      // Fallback to clean state if localStorage access fails
      console.warn('Failed to read rate limit state from localStorage:', error);
      this.state = { requests: [], violations: 0 };
    }
    
    // Clean up expired timestamps
    this.cleanup();
  }
  
  /**
   * Check if a request is allowed based on rate limits
   * @returns {boolean} Whether the request is allowed
   */
  isAllowed(): boolean {
    this.cleanup();
    
    // Check if currently blocked
    if (this.state.blockedUntil && this.state.blockedUntil > Date.now()) {
      return false;
    }
    
    // Count requests within time window
    const now = Date.now();
    const requestsInWindow = this.state.requests.filter(
      timestamp => timestamp > now - this.options.timeWindow
    );
    
    // If exceeded limit, block for specified duration
    if (requestsInWindow.length >= this.options.maxRequests) {
      this.state.blockedUntil = now + (this.options.blockDuration || this.options.timeWindow * 2);
      this.state.violations = (this.state.violations || 0) + 1;
      this.saveState();
      
      // Log rate limit violation for security monitoring
      const blockDurationSecs = Math.round((this.options.blockDuration || this.options.timeWindow * 2) / 1000);
      
      securityLogger.warn(
        this.options.securityEventType || SecurityEventType.RATE_LIMIT,
        `Rate limit exceeded: ${this.options.maxRequests} requests in ${this.options.timeWindow/1000}s. Blocked for ${blockDurationSecs}s.`,
        {
          maxRequests: this.options.maxRequests,
          timeWindow: this.options.timeWindow,
          requestsCount: requestsInWindow.length,
          blockedUntil: new Date(this.state.blockedUntil).toISOString(),
          violations: this.state.violations
        }
      );
      
      // Progressive blocking: Increase block duration for repeat offenders
      if (this.state.violations > 3) {
        // Exponential backoff for repeat violations
        const multiplier = Math.min(Math.pow(2, this.state.violations - 3), 12); // Cap at 12x
        this.state.blockedUntil = now + (this.options.blockDuration || this.options.timeWindow * 2) * multiplier;
        
        securityLogger.error(
          SecurityEventType.SUSPICIOUS_ACTIVITY,
          `Multiple rate limit violations detected. Extended block applied.`,
          {
            violations: this.state.violations,
            multiplier: multiplier,
            extendedBlockDuration: multiplier * (this.options.blockDuration || this.options.timeWindow * 2) / 1000 + " seconds",
            blockedUntil: new Date(this.state.blockedUntil).toISOString()
          }
        );
        
        this.saveState();
      }
      
      return false;
    }
    
    return true;
  }
  
  /**
   * Record a request attempt
   */
  recordRequest(): void {
    this.state.requests.push(Date.now());
    this.saveState();
  }
  
  /**
   * Try to make a request, recording the attempt
   * @returns {boolean} Whether the request is allowed
   */
  tryRequest(): boolean {
    if (!this.isAllowed()) {
      return false;
    }
    
    this.recordRequest();
    return true;
  }
  
  /**
   * Get time remaining until unblocked (in milliseconds)
   * @returns {number} Time in milliseconds until unblocked, or 0 if not blocked
   */
  getTimeUntilUnblocked(): number {
    if (!this.state.blockedUntil) {
      return 0;
    }
    
    const timeRemaining = this.state.blockedUntil - Date.now();
    return timeRemaining > 0 ? timeRemaining : 0;
  }
  
  /**
   * Get the number of violations recorded for this rate limiter
   * @returns {number} Number of violations
   */
  getViolationCount(): number {
    return this.state.violations || 0;
  }
  
  /**
   * Reset the violation count (e.g., after successful auth)
   */
  resetViolations(): void {
    this.state.violations = 0;
    this.saveState();
  }
  
  /**
   * Clear any active blocks (use with caution)
   */
  clearBlock(): void {
    delete this.state.blockedUntil;
    this.saveState();
  }
  
  /**
   * Clean up expired timestamps and reset if needed
   */
  private cleanup(): void {
    const now = Date.now();
    
    // Clear block if expired
    if (this.state.blockedUntil && this.state.blockedUntil <= now) {
      delete this.state.blockedUntil;
    }
    
    // Remove timestamps outside the time window
    this.state.requests = this.state.requests.filter(
      timestamp => timestamp > now - this.options.timeWindow
    );
    
    // Reset violations count if no activity for a long time (24 hours)
    const oldestTimestamp = Math.min(...this.state.requests, now);
    if (this.state.violations && this.state.violations > 0 && now - oldestTimestamp > 86400000) {
      this.state.violations = 0;
    }
    
    this.saveState();
  }
  
  /**
   * Save current state to localStorage
   */
  private saveState(): void {
    try {
      localStorage.setItem(
        this.options.storageKey || '',
        JSON.stringify(this.state)
      );
    } catch (error) {
      console.error('Failed to save rate limit state:', error);
    }
  }
}

// Export pre-configured rate limiters for common operations
export const authRateLimiter = new RateLimiter({
  maxRequests: 5,
  timeWindow: 60000, // 1 minute
  storageKey: 'auth_rate_limit',
  securityEventType: SecurityEventType.AUTHENTICATION
});

export const apiRateLimiter = new RateLimiter({
  maxRequests: 60,
  timeWindow: 60000, // 1 minute
  storageKey: 'api_rate_limit',
  securityEventType: SecurityEventType.API_ACCESS
});

// Additional specialized rate limiters
export const formSubmissionLimiter = new RateLimiter({
  maxRequests: 10,
  timeWindow: 60000, // 1 minute
  storageKey: 'form_submission_rate_limit',
  securityEventType: SecurityEventType.DATA_ACCESS
});

// Sensitive operation rate limiter (stricter limits)
export const sensitiveOperationLimiter = new RateLimiter({
  maxRequests: 3,
  timeWindow: 60000, // 1 minute
  blockDuration: 300000, // 5 minutes
  storageKey: 'sensitive_operation_rate_limit',
  securityEventType: SecurityEventType.SUSPICIOUS_ACTIVITY
});
