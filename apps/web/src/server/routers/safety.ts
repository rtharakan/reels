import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const safetyRouter = router({
  block: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.userId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot block yourself' });
      }

      // Execute block + cleanup in a single transaction
      const [idA, idB] = [ctx.userId, input.userId].sort();
      await ctx.prisma.$transaction([
        ctx.prisma.block.upsert({
          where: {
            blockerId_blockedUserId: {
              blockerId: ctx.userId,
              blockedUserId: input.userId,
            },
          },
          create: { blockerId: ctx.userId, blockedUserId: input.userId },
          update: {},
        }),
        ctx.prisma.match.deleteMany({
          where: { userAId: idA, userBId: idB },
        }),
        ctx.prisma.interest.deleteMany({
          where: {
            OR: [
              { fromUserId: ctx.userId, toUserId: input.userId },
              { fromUserId: input.userId, toUserId: ctx.userId },
            ],
          },
        }),
      ]);

      return { success: true };
    }),

  unblock: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.block.deleteMany({
        where: { blockerId: ctx.userId, blockedUserId: input.userId },
      });
      return { success: true };
    }),

  report: protectedProcedure
    .input(z.object({
      reportedUserId: z.string(),
      reason: z.enum(['SPAM', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'FAKE_PROFILE', 'OTHER']),
      description: z.string().max(1000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.reportedUserId === ctx.userId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot report yourself' });
      }

      const report = await ctx.prisma.report.create({
        data: {
          reporterId: ctx.userId,
          reportedUserId: input.reportedUserId,
          reason: input.reason,
          description: input.description,
        },
      });

      return { success: true, reportId: report.id };
    }),

  getBlockedUsers: protectedProcedure.query(async ({ ctx }) => {
    const blocks = await ctx.prisma.block.findMany({
      where: { blockerId: ctx.userId },
      include: {
        blockedUser: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return blocks.map((b) => ({
      userId: b.blockedUser.id,
      name: b.blockedUser.name,
      blockedAt: b.createdAt.toISOString(),
    }));
  }),
});
