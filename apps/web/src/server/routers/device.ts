import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const deviceRouter = router({
  registerPush: protectedProcedure
    .input(z.object({ token: z.string(), platform: z.literal('ios') }))
    .mutation(async ({ ctx, input }) => {
      // Delete any existing token for this user+device combo, then create
      await ctx.prisma.deviceToken.deleteMany({
        where: { userId: ctx.userId, token: input.token },
      });
      await ctx.prisma.deviceToken.create({
        data: {
          userId: ctx.userId,
          token: input.token,
          platform: input.platform,
        },
      });
      return { success: true };
    }),

  unregisterPush: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.deviceToken.deleteMany({
        where: { userId: ctx.userId, token: input.token },
      });
      return { success: true };
    }),
});
