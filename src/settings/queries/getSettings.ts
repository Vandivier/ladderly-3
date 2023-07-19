import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { AuthenticationError } from "blitz"
import db, { Subscription } from "db"
import { z } from "zod"

export type UserSettings = {
  nameFirst: string
  nameLast: string
  email: string
  emailBackup: string
  emailStripe: string
  subscription: Subscription
}

const GetSettings = z.object({})

export default resolver.pipe(
  resolver.zod(GetSettings),
  resolver.authorize(),
  async (_, ctx: Ctx): Promise<UserSettings> => {
    const userId = ctx.session.userId
    if (!userId) throw new AuthenticationError()

    const subscription = await db.subscription.findFirst({
      where: { userId },
      include: {
        user: {
          select: {
            nameFirst: true,
            nameLast: true,
            email: true,
            emailBackup: true,
            emailStripe: true,
          },
        },
        subscriptionChanges: true,
      },
    })

    if (!subscription) {
      throw new Error(`No subscription found for user ${userId}`)
    }

    return {
      nameFirst: subscription.user.nameFirst,
      nameLast: subscription.user.nameLast,
      email: subscription.user.email,
      emailBackup: subscription.user.emailBackup,
      emailStripe: subscription.user.emailStripe,
      subscription: subscription,
    }
  }
)
