import type { PrismaClient } from '@prisma/client';

/**
 * GDPR hard-delete job: purges soft-deleted users older than 30 days
 * with cascading data removal. (NFR-009)
 *
 * Run as a scheduled job (e.g., daily cron via Vercel Cron or external scheduler).
 */
export async function gdprCleanup(prisma: PrismaClient): Promise<{ purgedCount: number }> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Find users eligible for hard deletion
  const usersToDelete = await prisma.user.findMany({
    where: {
      deletedAt: { not: null, lte: thirtyDaysAgo },
    },
    select: { id: true },
  });

  if (usersToDelete.length === 0) {
    return { purgedCount: 0 };
  }

  const userIds = usersToDelete.map((u) => u.id);

  // Cascade delete all related data in a transaction
  await prisma.$transaction([
    // Remove device tokens
    prisma.deviceToken.deleteMany({ where: { userId: { in: userIds } } }),
    // Remove daily allocations
    prisma.dailyAllocation.deleteMany({ where: { userId: { in: userIds } } }),
    // Remove seen users (both directions)
    prisma.seenUser.deleteMany({
      where: { OR: [{ userId: { in: userIds } }, { seenUserId: { in: userIds } }] },
    }),
    // Remove match scores (both directions)
    prisma.matchScore.deleteMany({
      where: { OR: [{ userId: { in: userIds } }, { candidateId: { in: userIds } }] },
    }),
    // Remove reports (both directions)
    prisma.report.deleteMany({
      where: { OR: [{ reporterId: { in: userIds } }, { reportedUserId: { in: userIds } }] },
    }),
    // Remove blocks (both directions)
    prisma.block.deleteMany({
      where: { OR: [{ blockerId: { in: userIds } }, { blockedUserId: { in: userIds } }] },
    }),
    // Remove matches (both directions)
    prisma.match.deleteMany({
      where: { OR: [{ userAId: { in: userIds } }, { userBId: { in: userIds } }] },
    }),
    // Remove interests (both directions)
    prisma.interest.deleteMany({
      where: { OR: [{ fromUserId: { in: userIds } }, { toUserId: { in: userIds } }] },
    }),
    // Remove watchlist/watched/liked/rating entries
    prisma.watchlistEntry.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.watchedEntry.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.likedEntry.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.ratingEntry.deleteMany({ where: { userId: { in: userIds } } }),
    // Remove buddy data
    prisma.buddyMessage.deleteMany({ where: { senderId: { in: userIds } } }),
    prisma.buddyInterest.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.buddyRequest.deleteMany({ where: { creatorId: { in: userIds } } }),
    // Remove sessions and accounts (BetterAuth)
    prisma.session.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.account.deleteMany({ where: { userId: { in: userIds } } }),
    // Finally, hard-delete the users
    prisma.user.deleteMany({ where: { id: { in: userIds } } }),
  ]);

  return { purgedCount: userIds.length };
}
