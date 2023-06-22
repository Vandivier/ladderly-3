import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { AuthenticationError } from "blitz"
import db, { PaymentTierEnum } from "db"
import { z } from "zod"

const GetSettings = z.object({})

export default resolver.pipe(
  resolver.zod(GetSettings),
  resolver.authorize(),
  async (_, ctx: Ctx) => {
    const userId = ctx.session.userId
    if (!userId) throw new AuthenticationError()

    const subscription = await db.subscription.findFirst({
      where: { userId },
      include: { subscriptionChanges: true },
    })

    if (!subscription) {
      const newSubscription = await db.subscription.create({
        data: {
          tier: PaymentTierEnum.FREE,
          userId: userId,
        },
        include: { subscriptionChanges: true },
      })

      return newSubscription
    }

    return subscription
  }
)
