import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { AuthorizationError } from "blitz"
import db from "db"
import { UpdateSettingsSchema, isValidOptionalEmail } from "../schemas"

export default resolver.pipe(
  resolver.zod(UpdateSettingsSchema),
  resolver.authorize(),
  async (input, ctx: Ctx) => {
    const userId = ctx.session.userId

    if (userId === null) throw new AuthorizationError()
    const email = input.email.toLowerCase().trim()
    const emailBackup = input.emailBackup?.toLowerCase().trim() || ""
    const emailStripe = input.emailStripe?.toLowerCase().trim() || ""

    if (
      !email.includes("@") ||
      !email.includes(".") ||
      !isValidOptionalEmail(emailBackup) ||
      !isValidOptionalEmail(emailStripe)
    ) {
      throw new Error("invalid email")
    }

    const user = await db.user.update({
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
        nameFirst: input.nameFirst?.trim() || "",
        nameLast: input.nameLast?.trim() || "",
        profileBlurb: input.profileBlurb?.trim() || null,
        profileContactEmail: input.profileContactEmail?.toLowerCase().trim() || null,
        profileGitHubUri: input.profileGitHubUri?.trim() || null,
        profileHomepageUri: input.profileHomepageUri?.trim() || null,
        profileLinkedInUri: input.profileLinkedInUri?.trim() || null,
        residenceCountry: input.residenceCountry?.trim() || "",
        residenceUSState: input.residenceUSState?.trim() || "",
      },
    })

    return user
  }
)
