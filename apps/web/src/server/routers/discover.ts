import { z } from 'zod';
import { router, onboardedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { getDiscoverFeed } from '../services/discover-feed';
import { createMatchIfMutual } from '../services/match-creation';

export const discoverRouter = router({
  getFeed: onboardedProcedure.query(async ({ ctx }) => {
    return getDiscoverFeed(ctx.prisma, ctx.userId);
  }),

  expressInterest: onboardedProcedure
    .input(z.object({ targetUserId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.targetUserId === ctx.userId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot express interest in yourself' });
      }

      // Check target exists and not deleted
      const target = await ctx.prisma.user.findUnique({
        where: { id: input.targetUserId },
      });
      if (!target || target.deletedAt) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      // Check not blocked
      const block = await ctx.prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: ctx.userId, blockedUserId: input.targetUserId },
            { blockerId: input.targetUserId, blockedUserId: ctx.userId },
          ],
        },
      });
      if (block) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot interact with this user' });
      }

      // Create interest (idempotent via unique constraint)
      await ctx.prisma.interest.upsert({
        where: {
          fromUserId_toUserId: {
            fromUserId: ctx.userId,
            toUserId: input.targetUserId,
          },
        },
        create: {
          fromUserId: ctx.userId,
          toUserId: input.targetUserId,
        },
        update: {},
      });

      // Mark as seen
      await ctx.prisma.seenUser.upsert({
        where: {
          userId_seenUserId: {
            userId: ctx.userId,
            seenUserId: input.targetUserId,
          },
        },
        create: { userId: ctx.userId, seenUserId: input.targetUserId },
        update: {},
      });

      // Increment daily allocation
      await incrementDailyAllocation(ctx.prisma, ctx.userId);

      // Check for mutual match
      const matchResult = await createMatchIfMutual(ctx.prisma, ctx.userId, input.targetUserId);

      return {
        success: true,
        isMatch: matchResult.isMatch,
        matchId: matchResult.matchId,
      };
    }),

  skip: onboardedProcedure
    .input(z.object({ targetUserId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Mark as seen
      await ctx.prisma.seenUser.upsert({
        where: {
          userId_seenUserId: {
            userId: ctx.userId,
            seenUserId: input.targetUserId,
          },
        },
        create: { userId: ctx.userId, seenUserId: input.targetUserId },
        update: {},
      });

      // Increment daily allocation
      await incrementDailyAllocation(ctx.prisma, ctx.userId);

      return { success: true };
    }),
});

async function incrementDailyAllocation(
  prisma: typeof import('@/lib/prisma').prisma,
  userId: string,
) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { timezone: true } });
  const tz = user?.timezone ?? 'UTC';

  // Get today's date in user's timezone
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: tz }); // YYYY-MM-DD
  const todayStr = formatter.format(now);
  const localMidnight = new Date(`${todayStr}T00:00:00`);
  const utcMidnight = new Date(`${todayStr}T00:00:00Z`);
  const tzOffsetMs = utcMidnight.getTime() - localMidnight.getTime();
  const todayDate = new Date(utcMidnight.getTime() + tzOffsetMs);

  await prisma.dailyAllocation.upsert({
    where: {
      userId_allocatedDate: {
        userId,
        allocatedDate: todayDate,
      },
    },
    create: { userId, allocatedDate: todayDate, cardCount: 1 },
    update: { cardCount: { increment: 1 } },
  });
}
