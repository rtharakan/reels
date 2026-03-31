# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.3.x   | ✅ Active |
| < 1.3   | ❌ End of life |

## Reporting a Vulnerability

If you discover a security vulnerability in Reels, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, email **security@reels.app** with:

1. A description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if any)

We aim to respond within 48 hours and will work with you on a fix before public disclosure.

## Security Measures

### Authentication
- **Magic link authentication** via BetterAuth with 10-minute expiration
- **OAuth** (Google, Apple) optional social login
- Session tokens with 7-day expiry and 15-minute refresh windows
- httpOnly cookies with `reels` prefix
- Production auth secret validation rejects weak/default secrets

### Data Protection
- **HTTPS-only** profile photo URLs (validated via Zod schema)
- **Parameterized queries** via Prisma ORM (SQL injection prevention)
- **Input validation** on all API endpoints via Zod schemas
- **Rate limiting** on all public endpoints (in-memory, per-IP)
- **No plaintext secrets** — all credentials via environment variables

### Headers
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY` (clickjacking prevention)
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy` with strict directives
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### GDPR Compliance
- **Data export** — full personal data export (Art. 15)
- **Account deletion** — hard-delete of all user data (Art. 17)
- **Privacy consent** — explicit consent required during onboarding
- **Minimal data collection** — only what's needed for matching

### API Security
- Protected routes enforce authentication via `protectedProcedure`
- Onboarded-only routes enforce via `onboardedProcedure`
- IDOR prevention on match details (user ownership check)
- Self-action prevention (cannot block/report/interest yourself)
- Block enforcement on interest and feed (bidirectional)

## Dependencies

We use Dependabot for automated security updates. All dependencies are locked via `pnpm-lock.yaml`.
