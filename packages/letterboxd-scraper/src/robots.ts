const USER_AGENT = 'Reels/1.0 (film-matching-app)';
const LETTERBOXD_BASE = 'https://letterboxd.com';

export async function checkRobotsTxt(): Promise<boolean> {
  try {
    const res = await fetch(`${LETTERBOXD_BASE}/robots.txt`, {
      headers: { 'User-Agent': USER_AGENT },
    });
    const text = await res.text();
    // Watchlist pages are not blocked for generic user agents
    const lines = text.split('\n');
    let appliesToUs = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('User-agent: *')) {
        appliesToUs = true;
      } else if (trimmed.startsWith('User-agent:') && appliesToUs) {
        appliesToUs = false;
      }
      if (appliesToUs && trimmed.startsWith('Disallow:')) {
        const path = trimmed.replace('Disallow:', '').trim();
        if (path === '/') return false;
        // Check if watchlist paths are explicitly disallowed
        if (path.includes('watchlist')) return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}
