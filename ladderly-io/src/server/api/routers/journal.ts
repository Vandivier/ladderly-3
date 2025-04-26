import {
  JournalEntryType,
  PracticeCategory,
  ReminderFrequency,
  type Prisma,
} from '@prisma/client'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

// Zod schema for creating a journal entry
const createJournalEntrySchema = z.object({
  content: z.string().max(500),
  entryType: z.nativeEnum(JournalEntryType),
  isCareerRelated: z.boolean().default(true),
  isMarkdown: z.boolean().default(false),
  mintedFromHashtag: z.string().optional(),
  mintedFromDateRange: z.array(z.date()).optional(),
})

// Zod schema for updating journal reminder settings
const updateReminderSchema = z.object({
  isEnabled: z.boolean(),
  frequency: z.nativeEnum(ReminderFrequency),
})

export const journalRouter = createTRPCRouter({
  // Get user's journal entries with optional filtering
  getUserEntries: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.number().optional(),
        entryType: z.nativeEnum(JournalEntryType).optional(),
        isCareerRelated: z.boolean().optional(),
        fromDate: z.date().optional(),
        toDate: z.date().optional(),
        hashtag: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        limit,
        cursor,
        entryType,
        isCareerRelated,
        fromDate,
        toDate,
        hashtag,
      } = input

      const filter: Prisma.JournalEntryWhereInput = {
        userId: Number(ctx.session.user.id),
      }

      if (entryType) filter.entryType = entryType
      if (isCareerRelated !== undefined)
        filter.isCareerRelated = isCareerRelated

      if (fromDate ?? toDate) {
        filter.createdAt = {}
        if (fromDate) filter.createdAt.gte = fromDate
        if (toDate) filter.createdAt.lte = toDate
      }

      // Add hashtag search if provided
      if (hashtag) {
        filter.content = {
          contains: `#${hashtag}`,
        }
      }

      // Get total count for pagination
      const totalCount = await ctx.db.journalEntry.count({
        where: filter,
      })

      // Get entries with pagination
      const entries = await ctx.db.journalEntry.findMany({
        where: filter,
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
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

  // Search for journal entries by hashtag
  searchEntriesByHashtag: protectedProcedure
    .input(
      z.object({
        hashtag: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const entries = await ctx.db.journalEntry.findMany({
        where: {
          userId: Number(ctx.session.user.id),
          content: {
            contains: `#${input.hashtag}`,
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return entries
    }),

  // Create a new journal entry
  createEntry: protectedProcedure
    .input(createJournalEntrySchema)
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id)

      // Check if this is a minted entry
      const isMintedEntry = input.entryType === 'MINTED'

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
          userId,
        },
      })

      return entry
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

  // Get unique hashtags from user's entries
  getUserHashtags: protectedProcedure.query(async ({ ctx }) => {
    const userId = Number(ctx.session.user.id)

    // Get all entries for this user
    const entries = await ctx.db.journalEntry.findMany({
      where: {
        userId,
      },
      select: {
        content: true,
      },
    })

    // Extract hashtags from entry content
    const hashtagRegex = /#([a-zA-Z0-9_]+)/g
    const hashtagSet = new Set<string>()

    for (const entry of entries) {
      const matches = entry.content.match(hashtagRegex)
      if (matches) {
        matches.forEach((match) => {
          // Remove the # symbol and add to set
          hashtagSet.add(match.substring(1))
        })
      }
    }

    return Array.from(hashtagSet)
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
