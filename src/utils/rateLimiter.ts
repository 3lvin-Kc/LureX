
/**
 * Client-side rate limiter utility to prevent API abuse
 */

interface RateLimitOptions {
  maxRequests: number;    // Maximum number of requests allowed
  timeWindow: number;     // Time window in milliseconds
  storageKey?: string;    // Key to use for localStorage
}

interface RateLimitState {
  requests: number[];     // Timestamps of requests
  blockedUntil?: number;  // Timestamp until which requests are blocked
}

export class RateLimiter {
  private options: RateLimitOptions;
  private state: RateLimitState;
  
  constructor(options: RateLimitOptions) {
    this.options = {
      maxRequests: 60,
      timeWindow: 60000, // 1 minute
      storageKey: 'app_rate_limit',
      ...options
    };
    
    // Initialize state from localStorage if available
    const stored = localStorage.getItem(this.options.storageKey || '');
    this.state = stored ? JSON.parse(stored) : { requests: [] };
    
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
    
    // If exceeded limit, block for twice the time window
    if (requestsInWindow.length >= this.options.maxRequests) {
      this.state.blockedUntil = now + (this.options.timeWindow * 2);
      this.saveState();
      
      // Log rate limit violation for monitoring
      console.warn(`Rate limit exceeded: blocked until ${new Date(this.state.blockedUntil).toISOString()}`);
      
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
  storageKey: 'auth_rate_limit'
});

export const apiRateLimiter = new RateLimiter({
  maxRequests: 60,
  timeWindow: 60000, // 1 minute
  storageKey: 'api_rate_limit'
});
