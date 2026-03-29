import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRobotsTxt } from '../src/robots';

describe('checkRobotsTxt', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true when robots.txt allows scraping', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      text: () => Promise.resolve('User-agent: *\nDisallow: /api/\n'),
    }));
    const result = await checkRobotsTxt();
    expect(result).toBe(true);
  });

  it('returns false when robots.txt disallows all paths', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      text: () => Promise.resolve('User-agent: *\nDisallow: /\n'),
    }));
    const result = await checkRobotsTxt();
    expect(result).toBe(false);
  });

  it('returns false when robots.txt explicitly disallows watchlist', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      text: () => Promise.resolve('User-agent: *\nDisallow: /watchlist\n'),
    }));
    const result = await checkRobotsTxt();
    expect(result).toBe(false);
  });

  it('returns false on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network fail')));
    const result = await checkRobotsTxt();
    expect(result).toBe(false);
  });
});
