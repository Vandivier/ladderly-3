import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db, { PaymentTierEnum, Prisma } from "db"
import { z } from "zod"

export const tierValidator = z
  .string()
  .refine((value) => ["FREE", "PAY_WHAT_YOU_CAN", "PREMIUM"].includes(value), {
    message: "Invalid tier name",
  })

const UpdateSetting = z.object({
  where: z.object({
    id: z.number(),
  }),
  data: z.object({
    tier: tierValidator,
  }),
})

export default resolver.pipe(
  resolver.zod(UpdateSetting),
  resolver.authorize(),
  async ({ where, data }, ctx) => {
    const subscriptionUpdateInput: Prisma.SubscriptionUpdateInput = {
      user: { connect: { id: ctx.session.userId } },
      tier: data.tier as PaymentTierEnum,
    }
    const subscription = await db.subscription.update({ where, data: subscriptionUpdateInput })

    if (!subscription) throw new NotFoundError()

    const subscriptionChangeCreateInput: Prisma.SubscriptionChangeCreateInput = {
      user: {
        connect: { id: ctx.session.userId },
      },
      subscription: {
        connect: { id: subscription.id },
      },
      previousTier: subscription.tier,
      newTier: subscriptionUpdateInput.tier as PaymentTierEnum,
    }

    await db.subscriptionChange.create({
      data: subscriptionChangeCreateInput,
    })

    return subscription
  }
)
