// src/server/api/routers/user.ts

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { PaymentTierEnum } from "@prisma/client";
import { z } from "zod";
import { TRPCError } from '@trpc/server';
import { NULL_RESULT_TRPC_INT } from "~/server/constants";

const tiersOrder = {
  FREE: 0,
  PAY_WHAT_YOU_CAN: 1,
  PREMIUM: 2,
} as const;

// Define the settings input type
export const UpdateSettingsSchema = z.object({
  email: z.string(),
  emailBackup: z.string().nullable(),
  emailStripe: z.string().nullable(),
  nameFirst: z.string().nullable(),
  nameLast: z.string().nullable(),
  hasOpenToWork: z.boolean(),
  hasShoutOutsEnabled: z.boolean(),
  profileBlurb: z.string().nullable(),
  profileContactEmail: z.string().nullable(),
  profileGitHubUri: z.string().nullable(),
  profileHomepageUri: z.string().nullable(),
  profileLinkedInUri: z.string().nullable(),
  residenceCountry: z.string(),
  residenceUSState: z.string(),
  hasPublicProfileEnabled: z.boolean(),
  hasSmallGroupInterest: z.boolean(),
  hasLiveStreamInterest: z.boolean(),
  hasOnlineEventInterest: z.boolean(),
  hasInPersonEventInterest: z.boolean(),
});

// Define the settings output type
export const UserSettingsSchema = z.object({
  id: z.number(),
  email: z.string(),
  emailBackup: z.string().nullable(),
  emailStripe: z.string().nullable(),
  nameFirst: z.string().nullable(),
  nameLast: z.string().nullable(),
  hasOpenToWork: z.boolean(),
  hasShoutOutsEnabled: z.boolean(),
  profileBlurb: z.string().nullable(),
  profileContactEmail: z.string().nullable(),
  profileGitHubUri: z.string().nullable(),
  profileHomepageUri: z.string().nullable(),
  profileLinkedInUri: z.string().nullable(),
  residenceCountry: z.string(),
  residenceUSState: z.string(),
  hasPublicProfileEnabled: z.boolean(),
  hasSmallGroupInterest: z.boolean(),
  hasLiveStreamInterest: z.boolean(),
  hasOnlineEventInterest: z.boolean(),
  hasInPersonEventInterest: z.boolean(),
  subscription: z.object({
    tier: z.nativeEnum(PaymentTierEnum),
    type: z.string(),
  }),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;

export const userRouter = createTRPCRouter({
  getCurrentUser: publicProcedure.query(async ({ ctx }) => {
    const email = ctx?.session?.user?.email;

    if (!email) {
      return NULL_RESULT_TRPC_INT;
    }

    const user = await ctx.db.user.findUnique({
      where: {
        email,
      },
      include: {
        subscriptions: true
      }
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }),

  getSubscriptionLevel: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: {
        id: parseInt(ctx.session.user.id),
      },
      include: {
        subscriptions: true
      }
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.subscriptions.length === 0) {
      return { tier: PaymentTierEnum.FREE };
    }

    let minTier: PaymentTierEnum = PaymentTierEnum.PREMIUM;

    for (const subscription of user.subscriptions) {
      if (subscription.tier === PaymentTierEnum.PREMIUM) {
        minTier = PaymentTierEnum.PREMIUM;
        break;
      } else if (
        subscription.tier === PaymentTierEnum.PAY_WHAT_YOU_CAN &&
        tiersOrder[minTier] > tiersOrder[PaymentTierEnum.PAY_WHAT_YOU_CAN]
      ) {
        minTier = PaymentTierEnum.PAY_WHAT_YOU_CAN;
      } else if (
        subscription.tier === PaymentTierEnum.FREE &&
        tiersOrder[minTier] > tiersOrder[PaymentTierEnum.FREE]
      ) {
        minTier = PaymentTierEnum.FREE;
      }
    }

    return { tier: minTier };
  }),

  // TODO: should this be protected?
  getPaginatedUsers: publicProcedure
    .input(
      z.object({
        skip: z.number(),
        take: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { skip, take } = input;

      const users = await ctx.db.user.findMany({
        where: {
          hasPublicProfileEnabled: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: take + 1,
        select: {
          id: true,
          uuid: true,
          createdAt: true,
          nameFirst: true,
          nameLast: true,
          hasPublicProfileEnabled: true,
          hasShoutOutsEnabled: true,
          hasOpenToWork: true,
          profileBlurb: true,
          profileContactEmail: true,
          profileGitHubUri: true,
          profileHomepageUri: true,
          profileLinkedInUri: true,
          totalContributions: true,
        },
      });

      const hasMore = users.length > take;
      const paginatedUsers = hasMore ? users.slice(0, -1) : users;

      return {
        users: paginatedUsers,
        hasMore,
      };
    }),

  getUser: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      // Validate ID is an integer
      if (input.id !== parseInt(input.id.toString())) {
        throw new TRPCError({ 
          code: 'NOT_FOUND',
          message: 'User not found'
        });
      }

      const isOwnData = ctx.session?.user?.id === input.id.toString();

      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          uuid: true,
          nameFirst: true,
          nameLast: true,
          hasPublicProfileEnabled: true,
          hasShoutOutsEnabled: true,
          hasOpenToWork: true,
          profileBlurb: true,
          profileContactEmail: true,
          profileGitHubUri: true,
          profileHomepageUri: true,
          profileLinkedInUri: true,
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
      });

      if (!user) {
        throw new TRPCError({ 
          code: 'NOT_FOUND',
          message: 'User not found'
        });
      }

      if (!isOwnData && !user.hasPublicProfileEnabled) {
        throw new TRPCError({ 
          code: 'UNAUTHORIZED',
          message: 'You do not have permission to view this user data.'
        });
      }

      return user;
    }),

  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const id = parseInt(ctx.session.user.id);
    
    const result = await ctx.db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id },
        include: {
          subscriptions: {
            where: { type: 'ACCOUNT_PLAN' },
            select: { tier: true, type: true },
          },
        },
      });

      if (!user) {
        throw new TRPCError({ 
          code: 'NOT_FOUND',
          message: 'User not found'
        });
      }

      let subscription = user.subscriptions[0];

      if (!subscription) {
        subscription = await tx.subscription.create({
          data: {
            userId: id,
            tier: PaymentTierEnum.FREE,
            type: 'ACCOUNT_PLAN',
          },
        });
      }

      const settings: UserSettings = {
        id: user.id,
        email: user.email,
        emailBackup: user.emailBackup,
        emailStripe: user.emailStripe,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        hasOpenToWork: user.hasOpenToWork,
        hasShoutOutsEnabled: user.hasShoutOutsEnabled,
        profileBlurb: user.profileBlurb,
        profileContactEmail: user.profileContactEmail,
        profileGitHubUri: user.profileGitHubUri,
        profileHomepageUri: user.profileHomepageUri,
        profileLinkedInUri: user.profileLinkedInUri,
        residenceCountry: user.residenceCountry,
        residenceUSState: user.residenceUSState,
        hasPublicProfileEnabled: user.hasPublicProfileEnabled,
        hasSmallGroupInterest: user.hasSmallGroupInterest,
        hasLiveStreamInterest: user.hasLiveStreamInterest,
        hasOnlineEventInterest: user.hasOnlineEventInterest,
        hasInPersonEventInterest: user.hasInPersonEventInterest,
        subscription: {
          tier: subscription.tier,
          type: subscription.type,
        },
      };

      return UserSettingsSchema.parse(settings);
    });

    return result;
  }),

  updateSettings: protectedProcedure
    .input(UpdateSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id);
      const email = input.email.toLowerCase().trim();
      const emailBackup = input.emailBackup?.toLowerCase().trim() ?? '';
      const emailStripe = input.emailStripe?.toLowerCase().trim() ?? '';

      // Basic email validation
      const isValidEmail = (email: string) => 
        email === '' ?? (email.includes('@') && email.includes('.'));

      if (
        !isValidEmail(email) ||
        !isValidEmail(emailBackup) ||
        !isValidEmail(emailStripe)
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid email format'
        });
      }

      const user = await ctx.db.user.update({
        where: { id: userId },
        data: {
          email,
          emailBackup,
          emailStripe,
          hasInPersonEventInterest: input.hasInPersonEventInterest,
          hasOnlineEventInterest: input.hasOnlineEventInterest,
          hasLiveStreamInterest: input.hasLiveStreamInterest,
          hasOpenToWork: input.hasOpenToWork,
          hasPublicProfileEnabled: input.hasPublicProfileEnabled,
          hasShoutOutsEnabled: input.hasShoutOutsEnabled,
          hasSmallGroupInterest: input.hasSmallGroupInterest,
          nameFirst: input.nameFirst?.trim() ?? '',
          nameLast: input.nameLast?.trim() ?? '',
          profileBlurb: input.profileBlurb?.trim() ?? null,
          profileContactEmail: input.profileContactEmail?.toLowerCase().trim() ?? null,
          profileGitHubUri: input.profileGitHubUri?.trim() ?? null,
          profileHomepageUri: input.profileHomepageUri?.trim() ?? null,
          profileLinkedInUri: input.profileLinkedInUri?.trim() ?? null,
          residenceCountry: input.residenceCountry?.trim() ?? '',
          residenceUSState: input.residenceUSState?.trim() ?? '',
        },
        include: {
          subscriptions: {
            where: { type: 'ACCOUNT_PLAN' },
            select: { tier: true, type: true },
          },
        },
      });

      const subscription = user.subscriptions[0] ?? {
        tier: PaymentTierEnum.FREE,
        type: 'ACCOUNT_PLAN',
      };

      const settings: UserSettings = {
        ...user,
        subscription,
      };

      return UserSettingsSchema.parse(settings);
    }),
});
