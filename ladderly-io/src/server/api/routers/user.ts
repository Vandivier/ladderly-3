import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { PaymentTierEnum } from "@prisma/client";

const tiersOrder = {
  FREE: 0,
  PAY_WHAT_YOU_CAN: 1,
  PREMIUM: 2,
} as const;

export const userRouter = createTRPCRouter({
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
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
});
