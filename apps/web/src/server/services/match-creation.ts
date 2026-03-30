import type { PrismaClient } from '@prisma/client';

export async function createMatchIfMutual(
  prisma: PrismaClient,
  fromUserId: string,
  toUserId: string,
): Promise<{ isMatch: boolean; matchId: string | null }> {
  // Check for reciprocal interest
  const reciprocal = await prisma.interest.findUnique({
    where: {
      fromUserId_toUserId: {
        fromUserId: toUserId,
        toUserId: fromUserId,
      },
    },
  });

  if (!reciprocal) {
    return { isMatch: false, matchId: null };
  }

  // Canonical ordering
  const sorted = [fromUserId, toUserId].sort();
  const userAId = sorted[0]!;
  const userBId = sorted[1]!;

  // Get match score
  const matchScore = await prisma.matchScore.findUnique({
    where: { userId_candidateId: { userId: fromUserId, candidateId: toUserId } },
  });

  // Use upsert to handle concurrent match creation race condition
  const match = await prisma.match.upsert({
    where: { userAId_userBId: { userAId, userBId } },
    create: {
      userAId,
      userBId,
      score: matchScore?.totalScore ?? 0,
      sharedFilmIds: matchScore?.sharedFilmIds ?? [],
    },
    update: {},
  });

  return { isMatch: true, matchId: match.id };
}
