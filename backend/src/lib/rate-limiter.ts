interface RateLimitEntry {
  count: number;
  firstAttemptAt: number;
  blockedUntil?: number;
}

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number; // Optional progressive lockout
}

class MemoryRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Run cleanup periodically to prevent memory leaks
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.blockedUntil && entry.blockedUntil < now) {
        this.store.delete(key);
      } else if (now - entry.firstAttemptAt > 60 * 60 * 1000) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Check if action is currently allowed for the given key.
   */
  public check(
    key: string,
    config: RateLimitConfig
  ): {
    allowed: boolean;
    remaining: number;
    resetSeconds: number;
    currentAttempts: number;
  } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry) {
      return {
        allowed: true,
        remaining: config.maxAttempts,
        resetSeconds: Math.ceil(config.windowMs / 1000),
        currentAttempts: 0,
      };
    }

    // Check if key is actively blocked
    if (entry.blockedUntil && entry.blockedUntil > now) {
      const resetSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetSeconds,
        currentAttempts: entry.count,
      };
    }

    // Check if the current window has expired
    if (now - entry.firstAttemptAt > config.windowMs) {
      // Window expired, reset
      this.store.delete(key);
      return {
        allowed: true,
        remaining: config.maxAttempts,
        resetSeconds: Math.ceil(config.windowMs / 1000),
        currentAttempts: 0,
      };
    }

    // Still in window
    const remaining = Math.max(0, config.maxAttempts - entry.count);
    const resetSeconds = Math.ceil((entry.firstAttemptAt + config.windowMs - now) / 1000);

    return {
      allowed: entry.count < config.maxAttempts,
      remaining,
      resetSeconds,
      currentAttempts: entry.count,
    };
  }

  /**
   * Increment attempt counter (e.g., after failed authentication).
   */
  public consume(
    key: string,
    config: RateLimitConfig
  ): {
    allowed: boolean;
    remaining: number;
    resetSeconds: number;
  } {
    const now = Date.now();
    let entry = this.store.get(key);

    if (!entry || now - entry.firstAttemptAt > config.windowMs) {
      entry = {
        count: 1,
        firstAttemptAt: now,
      };
      this.store.set(key, entry);
    } else {
      entry.count += 1;
    }

    // Check if limit exceeded
    if (entry.count >= config.maxAttempts) {
      const blockDuration = config.blockDurationMs || config.windowMs;
      entry.blockedUntil = now + blockDuration;
      const resetSeconds = Math.ceil(blockDuration / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetSeconds,
      };
    }

    const remaining = Math.max(0, config.maxAttempts - entry.count);
    const resetSeconds = Math.ceil((entry.firstAttemptAt + config.windowMs - now) / 1000);

    return {
      allowed: true,
      remaining,
      resetSeconds,
    };
  }

  /**
   * Reset entry on successful action (e.g., successful login).
   */
  public reset(key: string): void {
    this.store.delete(key);
  }
}

// Global singleton instance
export const rateLimiter = new MemoryRateLimiter();

// Configuration presets
export const RATE_LIMIT_CONFIGS = {
  // Login: 5 attempts per 15 minutes. 15-minute lockout if exceeded.
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,
    blockDurationMs: 15 * 60 * 1000,
  },
  // Sensitive auth verification / password reset: 10 per 15 min
  AUTH_VERIFY: {
    maxAttempts: 10,
    windowMs: 15 * 60 * 1000,
  },
  // General API endpoints: 60 requests per minute
  GENERAL_API: {
    maxAttempts: 60,
    windowMs: 60 * 1000,
  },
};

/**
 * Extract safe IP address from request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "127.0.0.1";
}
