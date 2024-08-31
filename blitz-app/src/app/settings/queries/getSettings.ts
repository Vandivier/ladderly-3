// src/settings/queries/getSettings.ts

import { resolver } from '@blitzjs/rpc'
import { PaymentTierEnum } from '@prisma/client'
import { Ctx } from 'blitz'
import db from 'db'

export interface UserSettings {
  id: number
  email: string
  emailBackup: string
  emailStripe: string
  nameFirst: string
  nameLast: string
  hasOpenToWork: boolean
  hasShoutOutsEnabled: boolean
  profileBlurb: string | null
  profileContactEmail: string | null
  profileGitHubUri: string | null
  profileHomepageUri: string | null
  profileLinkedInUri: string | null
  residenceCountry: string
  residenceUSState: string
  hasPublicProfileEnabled: boolean
  hasSmallGroupInterest: boolean
  hasLiveStreamInterest: boolean
  hasOnlineEventInterest: boolean
  hasInPersonEventInterest: boolean
  subscription: {
    tier: PaymentTierEnum
    type: string
  }
}
export default resolver.pipe(
  resolver.authorize(),
  async (_ = null, { session }: Ctx) => {
    const id = session.userId
    if (!id) throw new Error('User not found')
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id },
        include: {
          subscriptions: {
            where: { type: 'ACCOUNT_PLAN' },
            select: { tier: true, type: true },
          },
        },
      })

      if (!user) throw new Error('User not found')

      let subscription = user.subscriptions[0]

      if (!subscription) {
        // Create a new subscription if one doesn't exist
        subscription = await tx.subscription.create({
          data: {
            userId: id,
            tier: PaymentTierEnum.FREE,
            type: 'ACCOUNT_PLAN',
          },
        })
      }

      return {
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
      }
    })

    return result
  }
)
