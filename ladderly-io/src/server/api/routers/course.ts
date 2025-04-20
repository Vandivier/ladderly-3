import { z } from 'zod'
import { TRPCError } from '@trpc/server'

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc'

export const courseRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.course.findMany({
      orderBy: { title: 'asc' },
      include: {
        contentItems: {
          orderBy: { order: 'asc' },
        },
        flashCardDecks: true,
        quizzes: true,
      },
    })
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const course = await ctx.db.course.findUnique({
        where: { slug: input.slug },
        include: {
          contentItems: {
            orderBy: { order: 'asc' },
          },
          flashCardDecks: {
            include: {
              flashCards: true,
            },
          },
          quizzes: true,
        },
      })

      if (!course) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Course with slug '${input.slug}' not found`,
        })
      }

      return course
    }),

  getFlashCardDeckBySlug: publicProcedure
    .input(z.object({ courseSlug: z.string(), deckId: z.number() }))
    .query(async ({ ctx, input }) => {
      const deck = await ctx.db.flashCardDeck.findFirst({
        where: {
          id: input.deckId,
          course: {
            slug: input.courseSlug,
          },
        },
        include: {
          flashCards: true,
        },
      })

      if (!deck) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Flash card deck not found',
        })
      }

      return deck
    }),

  getQuizBySlug: publicProcedure
    .input(z.object({ courseSlug: z.string(), quizId: z.number() }))
    .query(async ({ ctx, input }) => {
      const quiz = await ctx.db.quiz.findFirst({
        where: {
          id: input.quizId,
          course: {
            slug: input.courseSlug,
          },
        },
        include: {
          flashCardDeck: {
            include: {
              flashCards: true,
            },
          },
        },
      })

      if (!quiz) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quiz not found',
        })
      }

      return quiz
    }),

  // For admin/protected operations
  create: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        title: z.string(),
        description: z.string(),
        contentItems: z
          .array(
            z.object({
              title: z.string(),
              description: z.string().optional(),
              contentUrl: z.string().optional(),
              contentType: z.enum([
                'TEXT',
                'VIDEO',
                'AUDIO',
                'DOCUMENT',
                'LINK',
                'EXERCISE',
              ]),
              order: z.number(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin by querying the database
      const user = await ctx.db.user.findUnique({
        where: { id: +ctx.session.user.id },
        select: { role: true },
      })

      if (!user || user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can create courses',
        })
      }

      return ctx.db.course.create({
        data: {
          slug: input.slug,
          title: input.title,
          description: input.description,
          contentItems: input.contentItems
            ? {
                create: input.contentItems,
              }
            : undefined,
        },
        include: {
          contentItems: true,
        },
      })
    }),
})
