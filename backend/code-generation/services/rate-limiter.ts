/**
 * Rate Limiter for AI Providers
 *
 * Implements token bucket algorithm for rate limiting AI API requests.
 * Supports both per-minute and per-day limits with in-memory storage.
 */

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerDay?: number;
  burstAllowance?: number; // Extra requests allowed in burst
}

export interface RateLimitStatus {
  allowed: boolean;
  requestsRemaining: number;
  resetTime: Date;
  dailyRequestsRemaining?: number;
  dailyResetTime?: Date;
  retryAfter?: number; // milliseconds
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
  capacity: number;
  refillRate: number; // tokens per millisecond
}

interface DailyCounter {
  requests: number;
  resetTime: number; // timestamp when counter resets
}

/**
 * In-memory rate limiter using token bucket algorithm
 */
export class RateLimiter {
  private buckets = new Map<string, TokenBucket>();
  private dailyCounters = new Map<string, DailyCounter>();

  constructor(private config: RateLimitConfig) {}

  /**
   * Check if a request is allowed and consume a token if so
   */
  checkLimit(identifier: string): RateLimitStatus {
    const now = Date.now();

    // Check daily limit first (if configured)
    if (this.config.requestsPerDay) {
      const dailyStatus = this.checkDailyLimit(identifier, now);
      if (!dailyStatus.allowed) {
        return dailyStatus;
      }
    }

    // Check per-minute limit
    const bucket = this.getBucket(identifier, now);
    this.refillBucket(bucket, now);

    const allowed = bucket.tokens >= 1;

    if (allowed) {
      bucket.tokens -= 1;
    }

    const resetTime = new Date(now + (60 * 1000)); // Next minute
    const dailyInfo = this.getDailyInfo(identifier, now);

    return {
      allowed,
      requestsRemaining: Math.floor(bucket.tokens),
      resetTime,
      dailyRequestsRemaining: dailyInfo?.remaining,
      dailyResetTime: dailyInfo?.resetTime,
      retryAfter: allowed ? undefined : this.calculateRetryAfter(bucket, now),
    };
  }

  /**
   * Get current status without consuming tokens
   */
  getStatus(identifier: string): RateLimitStatus {
    const now = Date.now();

    // Check daily limit
    let dailyInfo;
    if (this.config.requestsPerDay) {
      dailyInfo = this.getDailyInfo(identifier, now);
      if (dailyInfo && dailyInfo.remaining <= 0) {
        return {
          allowed: false,
          requestsRemaining: 0,
          resetTime: new Date(now + 60 * 1000),
          dailyRequestsRemaining: 0,
          dailyResetTime: dailyInfo.resetTime,
          retryAfter: dailyInfo.resetTime.getTime() - now,
        };
      }
    }

    // Check per-minute limit
    const bucket = this.getBucket(identifier, now);
    this.refillBucket(bucket, now);

    const allowed = bucket.tokens >= 1;
    const resetTime = new Date(now + 60 * 1000);

    return {
      allowed,
      requestsRemaining: Math.floor(bucket.tokens),
      resetTime,
      dailyRequestsRemaining: dailyInfo?.remaining,
      dailyResetTime: dailyInfo?.resetTime,
      retryAfter: allowed ? undefined : this.calculateRetryAfter(bucket, now),
    };
  }

  /**
   * Reset limits for an identifier (useful for testing)
   */
  reset(identifier: string): void {
    this.buckets.delete(identifier);
    this.dailyCounters.delete(identifier);
  }

  /**
   * Clear all stored limits (useful for testing)
   */
  clearAll(): void {
    this.buckets.clear();
    this.dailyCounters.clear();
  }

  /**
   * Get or create token bucket for identifier
   */
  private getBucket(identifier: string, now: number): TokenBucket {
    let bucket = this.buckets.get(identifier);

    if (!bucket) {
      const capacity = this.config.requestsPerMinute + (this.config.burstAllowance || 0);
      bucket = {
        tokens: capacity,
        lastRefill: now,
        capacity,
        refillRate: this.config.requestsPerMinute / (60 * 1000), // requests per ms
      };
      this.buckets.set(identifier, bucket);
    }

    return bucket;
  }

  /**
   * Refill tokens in the bucket based on time elapsed
   */
  private refillBucket(bucket: TokenBucket, now: number): void {
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = timePassed * bucket.refillRate;

    bucket.tokens = Math.min(bucket.capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  /**
   * Check daily limit
   */
  private checkDailyLimit(identifier: string, now: number): RateLimitStatus {
    if (!this.config.requestsPerDay) {
      return {
        allowed: true,
        requestsRemaining: Infinity,
        resetTime: new Date(now + 60 * 1000)
      };
    }

    let counter = this.dailyCounters.get(identifier);
    const startOfDay = this.getStartOfDay(now);

    // Reset counter if it's a new day
    if (!counter || counter.resetTime <= now) {
      counter = {
        requests: 0,
        resetTime: startOfDay + 24 * 60 * 60 * 1000, // Next day
      };
      this.dailyCounters.set(identifier, counter);
    }

    const remaining = this.config.requestsPerDay - counter.requests;
    const allowed = remaining > 0;

    if (allowed) {
      counter.requests += 1;
    }

    return {
      allowed,
      requestsRemaining: Math.max(0, remaining - 1),
      resetTime: new Date(now + 60 * 1000),
      dailyRequestsRemaining: Math.max(0, remaining - (allowed ? 1 : 0)),
      dailyResetTime: new Date(counter.resetTime),
      retryAfter: allowed ? undefined : (counter.resetTime - now),
    };
  }

  /**
   * Get daily limit info without consuming
   */
  private getDailyInfo(identifier: string, now: number): {
    remaining: number;
    resetTime: Date;
  } | null {
    if (!this.config.requestsPerDay) {
      return null;
    }

    let counter = this.dailyCounters.get(identifier);
    const startOfDay = this.getStartOfDay(now);

    // Reset counter if it's a new day
    if (!counter || counter.resetTime <= now) {
      counter = {
        requests: 0,
        resetTime: startOfDay + 24 * 60 * 60 * 1000,
      };
      this.dailyCounters.set(identifier, counter);
    }

    return {
      remaining: Math.max(0, this.config.requestsPerDay - counter.requests),
      resetTime: new Date(counter.resetTime),
    };
  }

  /**
   * Calculate how long to wait before next request
   */
  private calculateRetryAfter(bucket: TokenBucket, now: number): number {
    // Time needed to get 1 token
    const timeForOneToken = 1 / bucket.refillRate;
    return Math.ceil(timeForOneToken);
  }

  /**
   * Get start of day timestamp
   */
  private getStartOfDay(timestamp: number): number {
    const date = new Date(timestamp);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }

  /**
   * Get configuration
   */
  getConfig(): RateLimitConfig {
    return { ...this.config };
  }
}

/**
 * Create rate limiter with Gemini free tier limits
 */
export function createGeminiRateLimiter(): RateLimiter {
  return new RateLimiter({
    requestsPerMinute: 10, // Conservative, Gemini allows 15/min
    requestsPerDay: 1000,  // Conservative, Gemini allows 1500/day
    burstAllowance: 2,     // Allow small bursts
  });
}

/**
 * Create rate limiter with custom config
 */
export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  return new RateLimiter(config);
}
