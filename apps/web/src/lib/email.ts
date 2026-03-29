export async function sendMagicLinkEmail(email: string, url: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY not set, logging to console');
    console.log(`[Magic Link] ${email}: ${url}`);
    return;
  }

  const { Resend } = await import('resend');
  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: process.env.SMTP_FROM ?? 'noreply@reels.app',
    to: email,
    subject: 'Sign in to Reels',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #6366f1; font-size: 24px; margin-bottom: 24px;">Reels</h1>
        <p style="color: #333; font-size: 16px; margin-bottom: 24px;">
          Click the button below to sign in to your Reels account.
        </p>
        <a href="${url}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
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
