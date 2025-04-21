import { z } from 'zod'
import { TRPCError } from '@trpc/server'

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc'

export const courseRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    // Get all courses with a limit of 10
    const courses = await ctx.db.course.findMany({
      take: 10,
      orderBy: { title: 'asc' },
      include: {
        contentItems: {
          orderBy: { order: 'asc' },
        },
        flashCardDecks: {
          include: {
            flashCards: true,
          },
        },
        quizzes: {
          include: {
            flashCardDeck: true,
          },
        },
      },
    })

    // Process courses to validate flash cards count
    const processedCourses = courses.map((course) => {
      // Extract the data we need without the flashCards
      const flashCardDecksWithoutCards = course.flashCardDecks.map((deck) => ({
        id: deck.id,
        name: deck.name,
        description: deck.description,
        createdAt: deck.createdAt,
        updatedAt: deck.updatedAt,
        courseId: deck.courseId,
      }))

      // Copy quizzes but filter out invalid ones
      let processedQuizzes = [...course.quizzes]

      // Check each quiz
      if (course.quizzes.length > 0) {
        const invalidQuizzes: number[] = []

        // Check if any quiz has a deck with less than 50 flash cards
        course.quizzes.forEach((quiz) => {
          // Find the associated deck
          const deck = course.flashCardDecks.find(
            (deck) => deck.id === quiz.flashCardDeckId,
          )

          if (deck ? deck.flashCards.length < 50 : true) {
            console.error(
              `Error: Course "${course.title}" (ID: ${course.id}) has quiz "${quiz.name}" (ID: ${quiz.id}) with fewer than 50 flash cards (found ${deck?.flashCards.length ?? 0})`,
            )
            invalidQuizzes.push(quiz.id)
          }
        })

        // Filter out invalid quizzes
        if (invalidQuizzes.length > 0) {
          processedQuizzes = processedQuizzes.filter(
            (quiz) => !invalidQuizzes.includes(quiz.id),
          )
        }
      }

      // Return a new object with the structure we want
      return {
        ...course,
        flashCardDecks: flashCardDecksWithoutCards,
        quizzes: processedQuizzes,
      }
    })

    return processedCourses
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
