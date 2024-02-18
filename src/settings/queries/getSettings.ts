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
  hasInPersonEventInterest: boolean
  hasLiveStreamInterest: boolean
  hasOnlineEventInterest: boolean
  hasOpenToWork: boolean
  hasPublicProfileEnabled: boolean
  hasShoutOutsEnabled: boolean
  hasSmallGroupInterest: boolean
  profileBlurb: string | null
  profileContactEmail: string | null
  profileGitHubUri: string | null
  profileHomepageUri: string | null
  profileLinkedInUri: string | null
  residenceCountry: string
  residenceUSState: string
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
            hasInPersonEventInterest: true,
            hasLiveStreamInterest: true,
            hasOnlineEventInterest: true,
            hasOpenToWork: true,
            hasPublicProfileEnabled: true,
            hasShoutOutsEnabled: true,
            hasSmallGroupInterest: true,
            profileBlurb: true,
            profileContactEmail: true,
            profileGitHubUri: true,
            profileHomepageUri: true,
            profileLinkedInUri: true,
            residenceCountry: true,
            residenceUSState: true,
          },
        },
        contributions: true,
      },
    })

    if (!subscription) {
      throw new Error(`No subscription found for user ${userId}`)
    }

    return {
      email: subscription.user.email,
      emailBackup: subscription.user.emailBackup,
      emailStripe: subscription.user.emailStripe,
      hasInPersonEventInterest: subscription.user.hasInPersonEventInterest,
      hasLiveStreamInterest: subscription.user.hasLiveStreamInterest,
      hasOnlineEventInterest: subscription.user.hasOnlineEventInterest,
      hasOpenToWork: subscription.user.hasOpenToWork,
      hasPublicProfileEnabled: subscription.user.hasPublicProfileEnabled,
      hasShoutOutsEnabled: subscription.user.hasShoutOutsEnabled,
      hasSmallGroupInterest: subscription.user.hasSmallGroupInterest,
      nameFirst: subscription.user.nameFirst,
      nameLast: subscription.user.nameLast,
      profileBlurb: subscription.user.profileBlurb,
      profileContactEmail: subscription.user.profileContactEmail,
      profileGitHubUri: subscription.user.profileGitHubUri,
      profileHomepageUri: subscription.user.profileHomepageUri,
      profileLinkedInUri: subscription.user.profileLinkedInUri,
      residenceCountry: subscription.user.residenceCountry,
      residenceUSState: subscription.user.residenceUSState,
      subscription: subscription,
    }
  }
)
