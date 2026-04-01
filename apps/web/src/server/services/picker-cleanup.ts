import { prisma } from '@/lib/prisma';

export async function cleanupExpiredPlans() {
  const now = new Date();

  // Find plans that have expired but are still in VOTING state
  const expiredPlans = await prisma.pickerPlan.findMany({
    where: {
      status: 'VOTING',
      expiresAt: { lt: now },
    },
    select: { id: true },
  });

  if (expiredPlans.length === 0) return { cleaned: 0 };

  const planIds = expiredPlans.map((p) => p.id);

  // Delete guest participants' votes first (guests have userId = null)
  const guestParticipants = await prisma.pickerParticipant.findMany({
    where: { planId: { in: planIds }, userId: null },
    select: { id: true },
  });
  const guestIds = guestParticipants.map((p) => p.id);

  if (guestIds.length > 0) {
    await prisma.pickerVote.deleteMany({
      where: { participantId: { in: guestIds } },
    });
    await prisma.pickerParticipant.deleteMany({
      where: { id: { in: guestIds } },
    });
  }

  // Set status to ARCHIVED
  await prisma.pickerPlan.updateMany({
    where: { id: { in: planIds } },
    data: { status: 'ARCHIVED' },
  });

  return { cleaned: expiredPlans.length };
}
