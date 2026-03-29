import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const deviceRouter = router({
  registerPush: protectedProcedure
    .input(z.object({ token: z.string(), platform: z.literal('ios') }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.deviceToken.upsert({
        where: { id: `${ctx.userId}-${input.token}` },
        create: {
          userId: ctx.userId,
          token: input.token,
          platform: input.platform,
        },
        update: {
          token: input.token,
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
