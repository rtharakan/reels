/**
 * Database reset script — clears all application data while preserving schema.
 * Run: npx tsx prisma/reset.ts
 *
 * WARNING: This deletes ALL data. Only use before production launch.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Resetting database — removing all test data...\n');

  // Delete in dependency order (children before parents)
  const results = await prisma.$transaction([
    prisma.buddyMessage.deleteMany(),
    prisma.buddyInterest.deleteMany(),
    prisma.buddyRequest.deleteMany(),
    prisma.deviceToken.deleteMany(),
    prisma.dailyAllocation.deleteMany(),
    prisma.seenUser.deleteMany(),
    prisma.matchScore.deleteMany(),
    prisma.match.deleteMany(),
    prisma.interest.deleteMany(),
    prisma.report.deleteMany(),
    prisma.block.deleteMany(),
    prisma.ratingEntry.deleteMany(),
    prisma.likedEntry.deleteMany(),
    prisma.watchedEntry.deleteMany(),
    prisma.watchlistEntry.deleteMany(),
    prisma.film.deleteMany(),
    prisma.verification.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const tables = [
    'BuddyMessage', 'BuddyInterest', 'BuddyRequest', 'DeviceToken',
    'DailyAllocation', 'SeenUser', 'MatchScore', 'Match', 'Interest',
    'Report', 'Block', 'RatingEntry', 'LikedEntry', 'WatchedEntry',
    'WatchlistEntry', 'Film', 'Verification', 'Session', 'Account', 'User',
  ];

  results.forEach((r, i) => {
    if (r.count > 0) console.log(`  ✓ ${tables[i]}: ${r.count} rows deleted`);
  });

  console.log('\n✅ Database reset complete. Ready for production.');
}

main()
  .catch((e) => {
    console.error('Reset failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
