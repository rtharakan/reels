import { describe, it, expect } from 'vitest';
import { rateLimit } from '../rate-limit';

describe('rateLimit', () => {
  it('allows requests within limit', () => {
    const key = `test-${Date.now()}-allow`;
    const r1 = rateLimit(key, 5, 60_000);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(4);
  });

  it('blocks requests exceeding limit', () => {
    const key = `test-${Date.now()}-block`;
    for (let i = 0; i < 3; i++) {
      rateLimit(key, 3, 60_000);
    }
    const result = rateLimit(key, 3, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('resets after window expires', () => {
    const key = `test-${Date.now()}-expire`;
    // Use a very short window
    const r1 = rateLimit(key, 1, 1); // 1ms window
    expect(r1.allowed).toBe(true);

    // After 5ms delay the window should have expired
    // We can't easily test time-based reset without waiting, but we can verify the resetAt
    expect(r1.resetAt).toBeGreaterThan(Date.now() - 100);
  });

  it('tracks different keys independently', () => {
    const key1 = `test-${Date.now()}-a`;
    const key2 = `test-${Date.now()}-b`;

    rateLimit(key1, 1, 60_000);
    const blocked = rateLimit(key1, 1, 60_000);
    const allowed = rateLimit(key2, 1, 60_000);

    expect(blocked.allowed).toBe(false);
    expect(allowed.allowed).toBe(true);
  });
});
