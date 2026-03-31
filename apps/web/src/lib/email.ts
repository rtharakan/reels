export async function sendMagicLinkEmail(email: string, url: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('RESEND_API_KEY is required in production — cannot send magic link');
    }
    console.warn('[Email] RESEND_API_KEY not set, logging to console (dev only)');
    console.log(`[Magic Link] ${email}: ${url}`);
    return;
  }

  const { Resend } = await import('resend');
  const resend = new Resend(apiKey);

  // Sanitize the URL to prevent HTML injection in the email template
  const safeUrl = url.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  await resend.emails.send({
    from: process.env.SMTP_FROM ?? 'noreply@reels.app',
    to: email,
    subject: 'Sign in to Reels',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #D4856A; font-size: 24px; margin-bottom: 24px;">Reels</h1>
        <p style="color: #333; font-size: 16px; margin-bottom: 24px;">
          Click the button below to sign in to your Reels account.
        </p>
        <a href="${safeUrl}" style="display: inline-block; background: #D4856A; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Sign in to Reels
        </a>
        <p style="color: #666; font-size: 14px; margin-top: 24px;">
          This link expires in 10 minutes. If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `Sign in to Reels: ${url}\n\nThis link expires in 10 minutes.`,
  });
}
