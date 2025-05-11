import {
  JournalEntryType,
  PracticeCategory,
  ReminderFrequency,
  type Prisma,
} from '@prisma/client'
import { z } from 'zod'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc'
import { TRPCError } from '@trpc/server'

const createJournalEntrySchema = z.object({
  content: z.string().max(500),
  entryType: z.nativeEnum(JournalEntryType),
  isCareerRelated: z.boolean().default(true),
  isMarkdown: z.boolean().default(false),
  mintedFromHashtag: z.string().optional(),
  mintedFromDateRange: z.array(z.date()).optional(),
  happiness: z.number().min(1).max(10).optional(),
})

const updateReminderSchema = z.object({
  isEnabled: z.boolean(),
  frequency: z.nativeEnum(ReminderFrequency),
})

const updateJournalEntrySchema = z.object({
  id: z.number(),
  content: z.string().max(500),
  entryType: z.enum(['WIN', 'PAIN_POINT', 'LEARNING', 'OTHER']).optional(),
  isCareerRelated: z.boolean().optional(),
  happiness: z.number().min(1).max(10).optional(),
})

export const journalRouter = createTRPCRouter({
  // Get user's journal entries with optional filtering
  getUserEntries: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().optional(),
        fromDate: z.date().optional(),
        entryType: z
          .enum(['WIN', 'PAIN_POINT', 'LEARNING', 'OTHER'])
          .optional(),
        isCareerRelated: z.boolean().optional(),
        textFilter: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        limit,
        cursor,
        fromDate,
        entryType,
        isCareerRelated,
        textFilter,
      } = input
      const userId = ctx.session?.user?.id

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to view journal entries',
        })
      }

      // Build filter based on inputs
      const filter: Prisma.JournalEntryWhereInput = {
        userId: Number(userId),
      }

      // Apply fromDate filter if provided
      if (fromDate) {
        filter.createdAt = {
          gte: fromDate,
        }
      }

      // Apply entryType filter if provided
      if (entryType) {
        filter.entryType = entryType
      }

      // Apply isCareerRelated filter if provided (undefined means show all)
      if (isCareerRelated !== undefined) {
        filter.isCareerRelated = isCareerRelated
      }

      // Apply text filter if provided
      if (textFilter) {
        filter.content = {
          contains: textFilter,
          mode: 'insensitive',
        }
      }

      // Get total count of all entries matching the filter
      const totalCount = await ctx.db.journalEntry.count({
        where: filter,
      })

      // Get entries with pagination
      const entries = await ctx.db.journalEntry.findMany({
        where: filter,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: 'desc',
        },
      })

      let nextCursor: number | undefined = undefined
      if (entries.length > limit) {
        const nextItem = entries.pop()
        nextCursor = nextItem?.id
      }

      return {
        entries,
        nextCursor,
        totalCount,
      }
    }),

  // Create a new journal entry
  createEntry: protectedProcedure
    .input(createJournalEntrySchema)
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id)
      const userTier = ctx.session.user.subscription.tier

      // Check if this is a minted entry
      const isMintedEntry = input.entryType === 'MINTED'

      // Daily limit for free tier users (only for non-minted entries)
      if (userTier === 'FREE' && !isMintedEntry) {
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Start of today

        const dailyCount = await ctx.db.journalEntry.count({
          where: {
            userId,
            createdAt: {
              gte: today,
            },
            entryType: {
              not: 'MINTED',
            },
          },
        })

        if (dailyCount >= 1) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message:
              'Free tier users can create one journal entry per day. Upgrade for unlimited entries!',
          })
        }
      }

      // Check entry count for the current week (last 7 days)
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      // For regular entries, check if user has reached the weekly limit of 21 entries
      if (!isMintedEntry) {
        const weeklyCount = await ctx.db.journalEntry.count({
          where: {
            userId,
            createdAt: {
              gte: oneWeekAgo,
            },
            entryType: {
              not: 'MINTED',
            },
          },
        })

        if (weeklyCount >= 21) {
          throw new Error(
            'You have reached the maximum limit of 21 journal entries per week',
          )
        }
      }
      // For minted entries, check if user has reached the weekly limit of 10 minted entries
      else {
        const weeklyMintedCount = await ctx.db.journalEntry.count({
          where: {
            userId,
            createdAt: {
              gte: oneWeekAgo,
            },
            entryType: 'MINTED',
          },
        })

        if (weeklyMintedCount >= 10) {
          throw new Error(
            'You have reached the maximum limit of 10 minted entries per week',
          )
        }
      }

      // Create the journal entry
      const entry = await ctx.db.journalEntry.create({
        data: {
          content: input.content,
          entryType: input.entryType,
          isCareerRelated: input.isCareerRelated,
          isMarkdown: input.isMarkdown ?? false,
          mintedFromHashtag: input.mintedFromHashtag,
          mintedFromDateRange: input.mintedFromDateRange ?? [],
          happiness: input.happiness,
          userId,
        },
      })

      return entry
    }),

  // Update a journal entry
  updateEntry: protectedProcedure
    .input(updateJournalEntrySchema)
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.db.journalEntry.findUnique({
        where: { id: input.id },
      })

      if (!entry) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Journal entry not found',
        })
      }

      if (entry.userId !== Number(ctx.session.user.id)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to update this entry',
        })
      }

      return ctx.db.journalEntry.update({
        where: { id: input.id },
        data: {
          content: input.content,
          entryType: input.entryType ?? entry.entryType,
          isCareerRelated: input.isCareerRelated ?? entry.isCareerRelated,
          happiness: input.happiness ?? entry.happiness,
        },
      })
    }),

  // Delete a journal entry
  deleteEntry: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.db.journalEntry.findUnique({
        where: { id: input.id },
      })

      if (!entry) {
        throw new Error('Journal entry not found')
      }

      if (entry.userId !== Number(ctx.session.user.id)) {
        throw new Error('Not authorized to delete this entry')
      }

      return ctx.db.journalEntry.delete({
        where: { id: input.id },
      })
    }),

  // Get user's reminder settings
  getUserReminderSettings: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: {
        id: Number(ctx.session.user.id),
      },
      select: {
        journalReminderEnabled: true,
        journalReminderFrequency: true,
        journalReminderLastReminded: true,
      },
    })

    // Return default settings if somehow user not found (shouldn't happen)
    if (!user) {
      return {
        isEnabled: false,
        frequency: ReminderFrequency.WEEKLY,
        lastReminded: null,
      }
    }

    // Map to original format to maintain API compatibility
    return {
      isEnabled: user.journalReminderEnabled,
      frequency: user.journalReminderFrequency,
      lastReminded: user.journalReminderLastReminded,
    }
  }),

  // Update user's reminder settings
  updateReminderSettings: protectedProcedure
    .input(updateReminderSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: {
          id: Number(ctx.session.user.id),
        },
        data: {
          journalReminderEnabled: input.isEnabled,
          journalReminderFrequency: input.frequency,
        },
        select: {
          journalReminderEnabled: true,
          journalReminderFrequency: true,
          journalReminderLastReminded: true,
        },
      })

      // Map to original format to maintain API compatibility
      return {
        isEnabled: user.journalReminderEnabled,
        frequency: user.journalReminderFrequency,
        lastReminded: user.journalReminderLastReminded,
      }
    }),

  // Get available practice items
  getPracticeItems: protectedProcedure
    .input(
      z.object({
        category: z.nativeEnum(PracticeCategory).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const filter: Prisma.JournalPracticeWhereInput = {}
      if (input.category) {
        filter.category = input.category
      }

      const practices = await ctx.db.journalPractice.findMany({
        where: filter,
        orderBy: { name: 'asc' },
      })

      return practices
    }),

  // Log practice completion
  logPracticeCompletion: protectedProcedure
    .input(z.object({ practiceId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Check if practice exists
      const practice = await ctx.db.journalPractice.findUnique({
        where: { id: input.practiceId },
      })

      if (!practice) {
        throw new Error('Practice item not found')
      }

      // Create practice completion record
      return ctx.db.userJournalPracticeCompletion.create({
        data: {
          userId: Number(ctx.session.user.id),
          practiceId: input.practiceId,
        },
      })
    }),

  // Get practice completions for the current user
  getUserPracticeCompletions: protectedProcedure
    .input(
      z.object({
        fromDate: z.date().optional(),
        toDate: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { fromDate, toDate } = input
      const filter: Prisma.UserJournalPracticeCompletionWhereInput = {
        userId: Number(ctx.session.user.id),
      }

      if (fromDate ?? toDate) {
        filter.createdAt = {}
        if (fromDate) filter.createdAt.gte = fromDate
        if (toDate) filter.createdAt.lte = toDate
      }

      return ctx.db.userJournalPracticeCompletion.findMany({
        where: filter,
        orderBy: { createdAt: 'desc' },
        include: {
          practice: true,
        },
      })
    }),
})
