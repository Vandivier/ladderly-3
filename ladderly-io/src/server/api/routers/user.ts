// src/server/api/routers/user.ts

import { PaymentTierEnum, Prisma } from '@prisma/client'
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
  UpdateUserSettingsSchema,
  UserSettings,
  UserWithSubscriptions,
  UserWithSubscriptionsOrZero,
} from '~/server/schemas'
import { tiersOrder } from '~/server/schemas'

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
        skip: z.number(),
        take: z.number(),
        searchTerm: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { skip, take, searchTerm } = input

      const where = {
        hasPublicProfileEnabled: true,
        ...(searchTerm
          ? {
              OR: [
                {
                  profileBlurb: {
                    contains: searchTerm,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  nameFirst: {
                    contains: searchTerm,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  nameLast: {
                    contains: searchTerm,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              ],
            }
          : {}),
      }

      const users = await ctx.db.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: take + 1,
        select: {
          id: true,
          uuid: true,
          createdAt: true,
          hasOpenToWork: true,
          hasPublicProfileEnabled: true,
          hasShoutOutsEnabled: true,
          nameFirst: true,
          nameLast: true,
          profileBlurb: true,
          profileContactEmail: true,
          profileGitHubUri: true,
          profileHomepageUri: true,
          profileLinkedInUri: true,
          profileTopNetworkingReasons: true,
          profileTopServices: true,
          profileTopSkills: true,
          profileYearsOfExperience: true,
          residenceCountry: true,
          residenceUSState: true,
        },
      })

      const hasMore = users.length > take
      const paginatedUsers = hasMore ? users.slice(0, -1) : users

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

      if (!subscription) {
        subscription = await tx.subscription.create({
          data: {
            userId: id,
            tier: PaymentTierEnum.FREE,
            type: 'ACCOUNT_PLAN',
          },
        })
      }

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
})
