import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from '@trpc/server';
import { sendForgotPasswordEmail } from '~/server/mailers/forgotPasswordMailer';

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

  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const { email } = input;
      
      const user = await ctx.db.user.findUnique({ where: { email } });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'If your email is in our system, you will receive instructions to reset your password shortly.',
        });
      }

      await sendForgotPasswordEmail({ to: user.email, token: "generated-token" });

      return { success: true };
    }),
}); 