import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { sendForgotPasswordEmail } from '~/server/mailers/forgotPasswordMailer'
import crypto from 'crypto'
import * as argon2 from 'argon2'
import { Signup } from '~/app/(auth)/schemas'
import { checkGuestRateLimit } from '~/server/utils/rateLimit'

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const authRouter = createTRPCRouter({
  validateCredentials: publicProcedure
    .input(LoginSchema)
    .mutation(async ({ ctx, input }) => {
      const { email } = input

      // Rate limiting for guests only
      if (!ctx.session?.user) {
        await checkGuestRateLimit({
          db: ctx.db,
          email,
          maxAttempts: 5, // Allow 5 login attempts per hour (override default of 3)
          windowMs: 60 * 60 * 1000, // 1 hour (same as default)
          action: 'login',
          errorMessage:
            'Too many login attempts. Please wait before trying again.',
        })
      }

      const user = await ctx.db.user.findFirst({
        where: { email },
        select: {
          id: true,
          email: true,
          nameFirst: true,
          nameLast: true,
        },
      })

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        })
      }

      return user
    }),

  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const { email } = input

      const user = await ctx.db.user.findUnique({ where: { email } })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            'If your email is in our system, you will receive instructions to reset your password shortly.',
        })
      }

      // Rate limiting for guests only
      if (!ctx.session?.user) {
        await checkGuestRateLimit({
          db: ctx.db,
          userId: user.id,
          action: 'password_reset',
        })
      }

      const token = crypto.randomBytes(32).toString('hex')
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex')
      const thirtyMinutes = 30 * 60 * 1000

      await ctx.db.token.create({
        data: {
          userId: user.id,
          hashedToken,
          type: 'RESET_PASSWORD',
          expiresAt: new Date(Date.now() + thirtyMinutes),
          sentTo: user.email,
        },
      })

      await sendForgotPasswordEmail({ to: user.email, token })

      return { success: true }
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string().min(8),
        passwordConfirmation: z.string().min(8),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { token, password, passwordConfirmation } = input

      if (password !== passwordConfirmation) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Passwords do not match',
        })
      }

      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex')

      const tokenRecord = await ctx.db.token.findFirst({
        where: {
          hashedToken,
          type: 'RESET_PASSWORD',
          expiresAt: { gt: new Date() },
        },
      })

      if (!tokenRecord) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired token',
        })
      }

      const hashedPassword = await argon2.hash(password)

      await ctx.db.user.update({
        where: { id: tokenRecord.userId },
        data: { hashedPassword },
      })

      await ctx.db.token.delete({ where: { id: tokenRecord.id } })

      return { success: true }
    }),

  signup: publicProcedure.input(Signup).mutation(async ({ ctx, input }) => {
    const { email, password } = input

    // Rate limiting for guests only
    if (!ctx.session?.user) {
      await checkGuestRateLimit({
        db: ctx.db,
        email,
        // Uses default: maxAttempts: 3, windowMs: 1 hour
        action: 'signup',
        errorMessage:
          'Too many signup attempts. Please wait before trying again.',
      })
    }

    const existingUser = await ctx.db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'User already exists',
      })
    }

    const hashedPassword = await argon2.hash(password)

    const user = await ctx.db.user.create({
      data: {
        email: email.toLowerCase(),
        hashedPassword,
      },
    })

    return { success: true, userId: user.id }
  }),
})
