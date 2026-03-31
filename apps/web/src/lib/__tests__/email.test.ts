import { describe, it, expect, vi } from 'vitest';

describe('sendMagicLinkEmail', () => {
  it('logs to console in development when no API key is set', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    vi.stubEnv('NODE_ENV', 'development');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { sendMagicLinkEmail } = await import('../email');
    await sendMagicLinkEmail('test@example.com', 'https://reels.app/verify?token=abc');

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('RESEND_API_KEY not set'));
    consoleSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('throws in production when no API key is set', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    vi.stubEnv('NODE_ENV', 'production');

    // Need to re-import to pick up env changes
    vi.resetModules();
    const { sendMagicLinkEmail } = await import('../email');
    await expect(sendMagicLinkEmail('test@example.com', 'https://reels.app/verify?token=abc'))
      .rejects.toThrow('RESEND_API_KEY is required in production');
  });
});
