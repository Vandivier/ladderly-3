import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from '@trpc/server';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authRouter = createTRPCRouter({
  validateCredentials: publicProcedure
    .input(LoginSchema)
    .mutation(async ({ ctx, input }) => {
      const { email } = input;
      
      const user = await ctx.db.user.findFirst({ 
        where: { email },
        select: {
          id: true,
          email: true,
          nameFirst: true,
          nameLast: true,
        }
      });

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      return user;
    }),
}); 