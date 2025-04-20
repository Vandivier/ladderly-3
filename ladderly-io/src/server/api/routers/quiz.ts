import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

export const quizRouter = createTRPCRouter({
  // Get quiz info including last attempt and cooldown status
  getQuizInfo: protectedProcedure
    .input(
      z.object({
        courseSlug: z.string(),
        quizId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Get the user ID from the session
      const userId = +ctx.session.user.id

      // Get the quiz data
      const quiz = await ctx.db.quiz.findFirst({
        where: {
          id: input.quizId,
          course: {
            slug: input.courseSlug,
          },
        },
        include: {
          flashCardDeck: true,
          course: true,
        },
      })

      if (!quiz) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quiz not found',
        })
      }

      // Get the latest attempt for this user and quiz
      const latestAttempt = await ctx.db.quizResult.findFirst({
        where: {
          quizId: quiz.id,
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      // Calculate cooldown end time if there is a failed attempt
      let cooldownEndsAt = null
      let canAttempt = true

      if (latestAttempt && !latestAttempt.passed) {
        // If last attempt was a failure, check 24-hour cooldown
        const cooldownPeriod = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
        const cooldownEndTime = new Date(
          latestAttempt.createdAt.getTime() + cooldownPeriod,
        )
        cooldownEndsAt = cooldownEndTime
        canAttempt = new Date() > cooldownEndTime
      }

      return {
        quiz,
        latestAttempt,
        cooldownEndsAt,
        canAttempt,
      }
    }),

  // Get 50 random flashcards from a deck for a quiz
  getQuizFlashcards: protectedProcedure
    .input(z.object({ quizId: z.number() }))
    .query(async ({ ctx, input }) => {
      // Get the quiz with its flashcard deck
      const quiz = await ctx.db.quiz.findUnique({
        where: { id: input.quizId },
        include: { flashCardDeck: { include: { flashCards: true } } },
      })

      if (!quiz?.flashCardDeck?.flashCards) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quiz or flashcards not found',
        })
      }

      // Verify minimum number of flashcards
      if (quiz.flashCardDeck.flashCards.length < 50) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Quiz requires at least 50 flashcards',
        })
      }

      // Shuffle and select 50 random flashcards
      const shuffled = [...quiz.flashCardDeck.flashCards].sort(
        () => 0.5 - Math.random(),
      )
      const selectedCards = shuffled.slice(0, 50).map((card) => ({
        id: card.id,
        question: card.question,
        correctAnswer: card.correctAnswer,
        distractors: card.distractors,
        explanation: card.explanation,
      }))

      return {
        quizId: quiz.id,
        quizName: quiz.name,
        timeLimit: quiz.timeLimit,
        flashcards: selectedCards,
      }
    }),

  // Record a new quiz attempt
  submitQuizAttempt: protectedProcedure
    .input(
      z.object({
        quizId: z.number(),
        score: z.number().min(0).max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = +ctx.session.user.id

      // Check if there's an active cooldown
      const latestAttempt = await ctx.db.quizResult.findFirst({
        where: {
          quizId: input.quizId,
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      if (latestAttempt && !latestAttempt.passed) {
        const cooldownPeriod = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
        const cooldownEndTime = new Date(
          latestAttempt.createdAt.getTime() + cooldownPeriod,
        )

        if (new Date() < cooldownEndTime) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message:
              'You must wait 24 hours between quiz attempts after a failure',
          })
        }
      }

      // Record the quiz result
      const result = await ctx.db.quizResult.create({
        data: {
          user: { connect: { id: userId } },
          quiz: { connect: { id: input.quizId } },
          score: input.score,
          passed: input.score >= 80,
        },
        include: {
          quiz: {
            include: {
              course: true,
            },
          },
        },
      })

      return result
    }),

  // Get a user's quiz history
  getUserQuizHistory: protectedProcedure
    .input(z.object({ quizId: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = +ctx.session.user.id

      const results = await ctx.db.quizResult.findMany({
        where: {
          quizId: input.quizId,
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          quiz: true,
        },
      })

      return results
    }),
})
