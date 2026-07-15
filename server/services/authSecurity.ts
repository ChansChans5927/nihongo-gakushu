import crypto from "crypto";

const PASSWORD_ITERATIONS = 600_000;
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_DIGEST = "sha512";

interface AttemptWindow {
  count: number;
  resetAt: number;
}

export class FixedWindowRateLimiter {
  private attempts = new Map<string, AttemptWindow>();
  private recordedAttempts = 0;

  constructor(
    private readonly maxAttempts: number,
    private readonly windowMs: number,
  ) {}

  getRetryAfterSeconds(key: string, now = Date.now()): number | null {
    const attempt = this.attempts.get(key);
    if (!attempt) return null;
    if (attempt.resetAt <= now) {
      this.attempts.delete(key);
      return null;
    }
    return attempt.count >= this.maxAttempts
      ? Math.max(1, Math.ceil((attempt.resetAt - now) / 1000))
      : null;
  }

  recordAttempt(key: string, now = Date.now()): void {
    this.recordedAttempts += 1;
    if (this.recordedAttempts % 1_000 === 0) {
      for (const [storedKey, attempt] of this.attempts) {
        if (attempt.resetAt <= now) this.attempts.delete(storedKey);
      }
    }

    const current = this.attempts.get(key);
    if (!current || current.resetAt <= now) {
      this.attempts.set(key, { count: 1, resetAt: now + this.windowMs });
      if (this.attempts.size > 10_000) {
        const oldestKey = this.attempts.keys().next().value;
        if (oldestKey) this.attempts.delete(oldestKey);
      }
      return;
    }
    current.count += 1;

    if (this.attempts.size > 10_000) {
      const oldestKey = this.attempts.keys().next().value;
      if (oldestKey) this.attempts.delete(oldestKey);
    }
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

function derivePassword(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      PASSWORD_ITERATIONS,
      PASSWORD_KEY_LENGTH,
      PASSWORD_DIGEST,
      (error, derivedKey) => error ? reject(error) : resolve(derivedKey),
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await derivePassword(password, salt);
  return `${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const [salt, hashHex, extra] = storedHash.split(":");
    if (!salt || !hashHex || extra || !/^[a-f0-9]+$/i.test(hashHex)) return false;

    const stored = Buffer.from(hashHex, "hex");
    if (stored.length !== PASSWORD_KEY_LENGTH) return false;

    const candidate = await derivePassword(password, salt);
    return crypto.timingSafeEqual(stored, candidate);
  } catch {
    return false;
  }
}
