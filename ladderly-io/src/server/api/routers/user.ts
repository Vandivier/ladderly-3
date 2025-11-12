// src/server/api/routers/user.ts

import { PaymentTierEnum, type Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc'
import { NULL_RESULT_TRPC_INT } from '~/server/constants'
import {
  GetUserSettingsSchema,
  tiersOrder,
  UpdateUserSettingsSchema,
  type UserSettings,
  type UserWithSubscriptions,
  type UserWithSubscriptionsOrZero,
} from '~/server/schemas'

export const userRouter = createTRPCRouter({
  getCurrentUser: publicProcedure.query(
    async ({ ctx }): Promise<UserWithSubscriptionsOrZero> => {
      const email = ctx?.session?.user?.email

      if (!email) {
        return NULL_RESULT_TRPC_INT
      }

      const user: UserWithSubscriptions | null = await ctx.db.user.findUnique({
        where: {
          email,
        },
        include: {
          subscriptions: true,
        },
      })

      if (!user) {
        throw new Error('User not found')
      }

      return user
    },
  ),

  getSubscriptionLevel: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: {
        id: parseInt(ctx.session.user.id),
      },
      include: {
        subscriptions: true,
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (user.subscriptions.length === 0) {
      return { tier: PaymentTierEnum.FREE }
    }

    let minTier: PaymentTierEnum = PaymentTierEnum.PREMIUM

    for (const subscription of user.subscriptions) {
      if (subscription.tier === PaymentTierEnum.PREMIUM) {
        minTier = PaymentTierEnum.PREMIUM
        break
      } else if (
        subscription.tier === PaymentTierEnum.PAY_WHAT_YOU_CAN &&
        tiersOrder[minTier] > tiersOrder[PaymentTierEnum.PAY_WHAT_YOU_CAN]
      ) {
        minTier = PaymentTierEnum.PAY_WHAT_YOU_CAN
      } else if (
        subscription.tier === PaymentTierEnum.FREE &&
        tiersOrder[minTier] > tiersOrder[PaymentTierEnum.FREE]
      ) {
        minTier = PaymentTierEnum.FREE
      }
    }

    return { tier: minTier }
  }),

  getPaginatedUsers: publicProcedure
    .input(
      z.object({
        skip: z.number().optional().default(0),
        take: z.number().optional().default(10),
        searchTerm: z.string().optional(),
        openToWork: z.boolean().optional(),
        hasContact: z.boolean().optional(),
        hasNetworking: z.boolean().optional(),
        hasServices: z.boolean().optional(),
        hasTopSkills: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        skip,
        take,
        searchTerm,
        openToWork,
        hasContact,
        hasNetworking,
        hasServices,
        hasTopSkills,
      } = input

      // Build the where clause
      const where: Prisma.UserWhereInput = {
        hasPublicProfileEnabled: true,
      }

      // Add filters
      if (openToWork) {
        where.hasOpenToWork = true
      }

      if (hasContact) {
        where.OR = [
          { profileContactEmail: { not: null } },
          { profileLinkedInUri: { not: null } },
        ]
      }

      if (hasNetworking) {
        where.profileTopNetworkingReasons = { isEmpty: false }
      }

      if (hasServices) {
        where.profileTopServices = { isEmpty: false }
      }

      // Update the skill filter to check if the array is not empty
      if (hasTopSkills) {
        where.profileTopSkills = { isEmpty: false }
      }

      // Enhanced search functionality
      if (searchTerm && searchTerm.trim() !== '') {
        const term = searchTerm.trim().toLowerCase()

        where.OR = [
          // Name search
          { nameFirst: { contains: term, mode: 'insensitive' } },
          { nameLast: { contains: term, mode: 'insensitive' } },

          // Job title, company, and blurb search
          { profileCurrentJobTitle: { contains: term, mode: 'insensitive' } },
          { profileCurrentJobCompany: { contains: term, mode: 'insensitive' } },
          { profileBlurb: { contains: term, mode: 'insensitive' } },

          // Use raw SQL for substring matching in arrays
          {
            id: {
              in: await ctx.db.$queryRaw`
                SELECT id FROM "User"
                WHERE 
                  EXISTS (
                    SELECT 1 FROM unnest("profileTopSkills") AS skill
                    WHERE LOWER(skill) LIKE ${`%${term}%`}
                  )
                  OR EXISTS (
                    SELECT 1 FROM unnest("profileTopServices") AS service
                    WHERE LOWER(service) LIKE ${`%${term}%`}
                  )
                  OR EXISTS (
                    SELECT 1 FROM unnest("profileTopNetworkingReasons") AS reason
                    WHERE LOWER(reason) LIKE ${`%${term}%`}
                  )
              `.then((rows: unknown) =>
                (rows as { id: number }[]).map((row) => row.id),
              ),
            },
          },
        ]
      }

      // Get one more user than requested to check if there are more
      const users = await ctx.db.user.findMany({
        where,
        select: {
          hasOpenToWork: true,
          hasPublicProfileEnabled: true,
          id: true,
          nameFirst: true,
          nameLast: true,
          profileContactEmail: true,
          profileCurrentJobCompany: true,
          profileCurrentJobTitle: true,
          profilePicture: true,
          profileTopNetworkingReasons: true,
          profileTopServices: true,
          profileTopSkills: true,
          profileYearsOfExperience: true,
          profileLinkedInUri: true,
          profileBlurb: true,
        },
        orderBy: {
          id: 'desc',
        },
        skip,
        take: take + 1,
      })

      // Add a name field to each user by combining nameFirst and nameLast
      const usersWithName = users.map((user) => ({
        ...user,
        name: `${user.nameFirst} ${user.nameLast}`.trim(),
      }))

      const hasMore = usersWithName.length > take
      const paginatedUsers = hasMore
        ? usersWithName.slice(0, take)
        : usersWithName

      return {
        users: paginatedUsers,
        hasMore,
      }
    }),

  getUser: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      // Validate ID is an integer
      if (input.id !== parseInt(input.id.toString())) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      const isOwnData = ctx.session?.user?.id === input.id.toString()

      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          uuid: true,
          nameFirst: true,
          nameLast: true,
          hasOpenToRelocation: true,
          hasOpenToWork: true,
          hasPublicProfileEnabled: true,
          hasShoutOutsEnabled: true,
          profileBlurb: true,
          profileContactEmail: true,
          profileCurrentJobCompany: true,
          profileCurrentJobTitle: true,
          profileDiscordHandle: true,
          profileGitHubUri: true,
          profileHighestDegree: true,
          profileHomepageUri: true,
          profileLinkedInUri: true,
          profileTopNetworkingReasons: true,
          profileTopServices: true,
          profileTopSkills: true,
          profileYearsOfExperience: true,
          residenceCountry: true,
          userChecklists: {
            where: { isComplete: true },
            take: 3,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              checklist: true,
              createdAt: true,
              isComplete: true,
              updatedAt: true,
            },
          },
        },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      if (!isOwnData && !user.hasPublicProfileEnabled) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You do not have permission to view this user data.',
        })
      }

      return user
    }),

  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const id = parseInt(ctx.session.user.id)

    const result = await ctx.db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id },
        include: {
          subscriptions: {
            where: { type: 'ACCOUNT_PLAN' },
            select: { tier: true, type: true },
          },
        },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      let subscription = user.subscriptions[0]

      subscription ??= await tx.subscription.create({
        data: {
          userId: id,
          tier: PaymentTierEnum.FREE,
          type: 'ACCOUNT_PLAN',
        },
      })

      const settings: UserSettings = {
        email: user.email,
        emailBackup: user.emailBackup,
        emailStripe: user.emailStripe,
        hasInPersonEventInterest: user.hasInPersonEventInterest,
        hasLiveStreamInterest: user.hasLiveStreamInterest,
        hasOnlineEventInterest: user.hasOnlineEventInterest,
        hasOpenToRelocation: user.hasOpenToRelocation,
        hasOpenToWork: user.hasOpenToWork,
        hasPublicProfileEnabled: user.hasPublicProfileEnabled,
        hasShoutOutsEnabled: user.hasShoutOutsEnabled,
        hasSmallGroupInterest: user.hasSmallGroupInterest,
        id: user.id,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        profileBlurb: user.profileBlurb,
        profileContactEmail: user.profileContactEmail,
        profileCurrentJobCompany: user.profileCurrentJobCompany,
        profileCurrentJobTitle: user.profileCurrentJobTitle,
        profileDiscordHandle: user.profileDiscordHandle,
        profileGitHubUri: user.profileGitHubUri,
        profileHighestDegree: user.profileHighestDegree,
        profileHomepageUri: user.profileHomepageUri,
        profileLinkedInUri: user.profileLinkedInUri,
        profileTopNetworkingReasons: user.profileTopNetworkingReasons,
        profileTopSkills: user.profileTopSkills,
        profileTopServices: user.profileTopServices,
        profileYearsOfExperience: user.profileYearsOfExperience,
        residenceCountry: user.residenceCountry,
        residenceUSState: user.residenceUSState,
        subscription: {
          tier: subscription.tier,
          type: subscription.type,
        },
      }

      return GetUserSettingsSchema.parse(settings)
    })

    return result
  }),

  updateSettings: protectedProcedure
    .input(UpdateUserSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id)
      const email = input.email.toLowerCase().trim()
      const emailBackup = input.emailBackup?.toLowerCase().trim() ?? ''
      const emailStripe = input.emailStripe?.toLowerCase().trim() ?? ''

      // Basic email validation
      const isValidEmail = (email: string) =>
        email === '' || (email.includes('@') && email.includes('.'))

      if (
        !isValidEmail(email) ||
        !isValidEmail(emailBackup) ||
        !isValidEmail(emailStripe)
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid email format',
        })
      }

      const profileContactEmail =
        input.profileContactEmail?.toLowerCase().trim() ?? null
      const user = await ctx.db.user.update({
        where: { id: userId },
        data: {
          email,
          emailBackup,
          emailStripe,
          hasInPersonEventInterest: input.hasInPersonEventInterest,
          hasLiveStreamInterest: input.hasLiveStreamInterest,
          hasOnlineEventInterest: input.hasOnlineEventInterest,
          hasOpenToRelocation: input.hasOpenToRelocation,
          hasOpenToWork: input.hasOpenToWork,
          hasPublicProfileEnabled: input.hasPublicProfileEnabled,
          hasShoutOutsEnabled: input.hasShoutOutsEnabled,
          hasSmallGroupInterest: input.hasSmallGroupInterest,
          nameFirst: input.nameFirst?.trim() ?? '',
          nameLast: input.nameLast?.trim() ?? '',
          profileBlurb: input.profileBlurb?.trim() ?? null,
          profileContactEmail,
          profileCurrentJobCompany: input.profileCurrentJobCompany,
          profileCurrentJobTitle: input.profileCurrentJobTitle,
          profileDiscordHandle: input.profileDiscordHandle?.trim() ?? null,
          profileGitHubUri: input.profileGitHubUri?.trim() ?? null,
          profileHighestDegree: input.profileHighestDegree?.trim() ?? undefined,
          profileHomepageUri: input.profileHomepageUri?.trim() ?? null,
          profileLinkedInUri: input.profileLinkedInUri?.trim() ?? null,
          profileTopNetworkingReasons: input.profileTopNetworkingReasons ?? [],
          profileTopServices: input.profileTopServices ?? [],
          profileTopSkills: input.profileTopSkills ?? [],
          profileYearsOfExperience: input.profileYearsOfExperience,
          residenceCountry: input.residenceCountry?.trim() ?? '',
          residenceUSState: input.residenceUSState?.trim() ?? '',
        },
        include: {
          subscriptions: {
            where: { type: 'ACCOUNT_PLAN' },
            select: { tier: true, type: true },
          },
        },
      })

      const subscription = user.subscriptions[0] ?? {
        tier: PaymentTierEnum.FREE,
        type: 'ACCOUNT_PLAN',
      }

      const settings: UserSettings = {
        ...user,
        subscription,
      }

      return GetUserSettingsSchema.parse(settings)
    }),

  getLeadEmailPreferences: protectedProcedure.query(async ({ ctx }) => {
    const userId = parseInt(ctx.session.user.id)
    const email = ctx.session.user.email

    if (!email) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User email not found',
      })
    }

    // First try to find an existing lead
    let lead = await ctx.db.lead.findUnique({
      where: { email },
    })

    // If no lead exists, create one
    lead ??= await ctx.db.lead.create({
      data: {
        email,
        userId,
        isRecruiter: false,
        hasOptOutMarketing: false,
        hasOptOutFeatureUpdates: false,
        hasOptOutEventAnnouncements: false,
        hasOptOutNewsletterAndBlog: false,
      },
    })

    return lead
  }),

  updateEmailPreferences: protectedProcedure
    .input(
      z.object({
        isRecruiter: z.boolean(),
        hasOptOutMarketing: z.boolean(),
        hasOptOutFeatureUpdates: z.boolean(),
        hasOptOutEventAnnouncements: z.boolean(),
        hasOptOutNewsletterAndBlog: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const email = ctx.session.user.email

      if (!email) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User email not found',
        })
      }

      const lead = await ctx.db.lead.update({
        where: { email },
        data: {
          isRecruiter: input.isRecruiter,
          hasOptOutMarketing: input.hasOptOutMarketing,
          hasOptOutFeatureUpdates: input.hasOptOutFeatureUpdates,
          hasOptOutEventAnnouncements: input.hasOptOutEventAnnouncements,
          hasOptOutNewsletterAndBlog: input.hasOptOutNewsletterAndBlog,
        },
      })

      return lead
    }),

  // Get user profile - includes the deep journaling interest flag
  getUserProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = parseInt(ctx.session.user.id)

    const user = await ctx.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        hasDeepJournalingInterest: true,
        // Add any other profile fields needed
      },
    })

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }

    return user
  }),

  // Update user profile with minimal fields
  updateUserProfile: protectedProcedure
    .input(
      z.object({
        hasDeepJournalingInterest: z.boolean().optional(),
        // Add any other fields that can be updated
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id)

      const user = await ctx.db.user.update({
        where: { id: userId },
        data: {
          hasDeepJournalingInterest: input.hasDeepJournalingInterest,
          // Update other fields as needed
        },
        select: {
          id: true,
          hasDeepJournalingInterest: true,
        },
      })

      return user
    }),
})
