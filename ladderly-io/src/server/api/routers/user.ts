import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { PaymentTierEnum } from "@prisma/client";
import { z } from "zod";

const tiersOrder = {
  FREE: 0,
  PAY_WHAT_YOU_CAN: 1,
  PREMIUM: 2,
} as const;

export const userRouter = createTRPCRouter({
  getCurrentUser: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session) {
      return null;
    }

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
});
