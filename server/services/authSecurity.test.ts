import { describe, expect, it } from "vitest";
import { FixedWindowRateLimiter, hashPassword, verifyPassword } from "./authSecurity.ts";

describe("password hashing", () => {
  it("hashes and verifies passwords asynchronously", async () => {
    const hash = await hashPassword("Example!123");
    expect(hash).not.toContain("Example!123");
    expect(await verifyPassword("Example!123", hash)).toBe(true);
    expect(await verifyPassword("Wrong!123", hash)).toBe(false);
  });

  it("rejects malformed stored hashes", async () => {
    expect(await verifyPassword("Example!123", "invalid")).toBe(false);
  });
});

describe("FixedWindowRateLimiter", () => {
  it("blocks at the configured limit and resets after the window", () => {
    const limiter = new FixedWindowRateLimiter(2, 1_000);
    limiter.recordAttempt("user", 1_000);
    expect(limiter.getRetryAfterSeconds("user", 1_100)).toBeNull();
    limiter.recordAttempt("user", 1_100);
    expect(limiter.getRetryAfterSeconds("user", 1_200)).toBe(1);
    expect(limiter.getRetryAfterSeconds("user", 2_001)).toBeNull();
  });

  it("can clear failures after a successful login", () => {
    const limiter = new FixedWindowRateLimiter(1, 1_000);
    limiter.recordAttempt("user", 1_000);
    limiter.reset("user");
    expect(limiter.getRetryAfterSeconds("user", 1_100)).toBeNull();
  });
});
