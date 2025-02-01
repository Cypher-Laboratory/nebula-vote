import { config } from 'dotenv';

config();

interface RateLimitWindow {
  count: number;
  startTime: number;
}

class RateLimiter {
  private windowMs: number;
  private limits: Map<string, RateLimitWindow>;

  constructor(windowMs: number = (Number(process.env.TIME_PERIOD) || 30) * 60 * 1000) { // 30 minutes default
    this.windowMs = windowMs;
    this.limits = new Map();
  }

  private cleanOldEntries(key: string) {
    const now = Date.now();
    const window = this.limits.get(key);

    if (window && now - window.startTime >= this.windowMs) {
      this.limits.delete(key);
      return true;
    }
    return false;
  }

  async checkLimit(key: string, limit: number): Promise<boolean> {
    const now = Date.now();

    if (this.cleanOldEntries(key)) {
      // Window expired, create new window
      this.limits.set(key, {
        count: 1,
        startTime: now
      });
      return true;
    }

    const window = this.limits.get(key);
    if (!window) {
      // First request in window
      this.limits.set(key, {
        count: 1,
        startTime: now
      });
      return true;
    }

    if (window.count >= limit) {
      return false;
    }

    window.count++;
    return true;
  }

  getRemainingLimit(key: string, limit: number): number {
    this.cleanOldEntries(key);
    const window = this.limits.get(key);
    if (!window) return limit;
    return Math.max(0, limit - window.count);
  }
}

// Create instances for different rate limits
const globalPollLimiter = new RateLimiter();
const globalVoteLimiter = new RateLimiter();
const userVoteLimiter = new RateLimiter();

// Environment variables with defaults
const GLOBAL_POLLS_LIMIT = parseInt(process.env.GLOBAL_POLLS_LIMIT || '60');
const GLOBAL_VOTES_LIMIT = parseInt(process.env.GLOBAL_VOTES_LIMIT || '20000');
const USER_VOTES_LIMIT = parseInt(process.env.USER_VOTES_LIMIT || '6');

export const checkPollRateLimit = async (): Promise<boolean> => {
  return globalPollLimiter.checkLimit('global_polls', GLOBAL_POLLS_LIMIT);
};

export const checkVoteRateLimit = async (userId: string): Promise<boolean> => {
  // Check both global and user-specific vote limits
  const globalAllowed = await globalVoteLimiter.checkLimit('global_votes', GLOBAL_VOTES_LIMIT);
  if (!globalAllowed) return false;

  return userVoteLimiter.checkLimit(`user_votes_${userId}`, USER_VOTES_LIMIT);
};

export const getRemainingLimits = (userId: string) => {
  return {
    globalPolls: globalPollLimiter.getRemainingLimit('global_polls', GLOBAL_POLLS_LIMIT),
    globalVotes: globalVoteLimiter.getRemainingLimit('global_votes', GLOBAL_VOTES_LIMIT),
    userVotes: userVoteLimiter.getRemainingLimit(`user_votes_${userId}`, USER_VOTES_LIMIT),
  };
};