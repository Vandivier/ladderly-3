import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import {
  createTRPCRouter,
  protectedProcedureWithVerifiedEmail,
  publicProcedure,
} from '~/server/api/trpc'

export const certificateRouter = createTRPCRouter({
  // Get a specific certificate by user ID and quiz result ID
  getCertificate: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        quizResultId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Get the quiz result that acts as a certificate
      const certificate = await ctx.db.quizResult.findUnique({
        where: {
          id: input.quizResultId,
        },
        include: {
          user: true,
          quiz: {
            include: {
              course: true,
            },
          },
        },
      })

      if (!certificate) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Certificate not found',
        })
      }

      // Check if user ID matches and certificate is for a passed quiz
      if (certificate.userId !== input.userId || !certificate.passed) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Certificate not found',
        })
      }

      // Check if the user's profile is public or if the current user is viewing their own certificate
      const isCurrentUser = ctx.session?.user?.id === String(input.userId)
      if (!isCurrentUser && !certificate.user.hasPublicProfileEnabled) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'This certificate is not publicly visible',
        })
      }

      return certificate
    }),

  // Get all certificates for a user (either the current user or a public profile)
  getUserCertificates: publicProcedure
    .input(
      z.object({
        userId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Check if the user exists and whether their profile is public
      const user = await ctx.db.user.findUnique({
        where: {
          id: input.userId,
        },
        select: {
          hasPublicProfileEnabled: true,
        },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // Check if the current user can view the certificates
      const isCurrentUser = ctx.session?.user?.id === String(input.userId)
      if (!isCurrentUser && !user.hasPublicProfileEnabled) {
        return [] // Return empty array for non-public profiles
      }

      // Get all passed quiz results (certificates) for the user
      const certificates = await ctx.db.quizResult.findMany({
        where: {
          userId: input.userId,
          passed: true,
        },
        include: {
          quiz: {
            include: {
              course: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return certificates
    }),

  // Get the current user's certificates (protected route)
  getMyCurrentCertificates: protectedProcedureWithVerifiedEmail.query(
    async ({ ctx }) => {
      const userId = +ctx.session.user.id

      const certificates = await ctx.db.quizResult.findMany({
        where: {
          userId,
          passed: true,
        },
        include: {
          quiz: {
            include: {
              course: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return certificates
    },
  ),
})
