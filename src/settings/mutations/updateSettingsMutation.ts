import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { AuthorizationError } from "blitz"
import db from "db"
import { UpdateSettingsSchema } from "../schemas"

export default resolver.pipe(
  resolver.zod(UpdateSettingsSchema),
  resolver.authorize(),
  async (input, ctx: Ctx) => {
    const userId = ctx.session.userId

    if (userId === null) throw new AuthorizationError()

    const user = await db.user.update({
      where: { id: userId },
      data: {
        nameFirst: input.nameFirst?.trim() || "",
        nameLast: input.nameLast?.trim() || "",
        email: input.email?.toLowerCase().trim() || "",
        emailBackup: input.emailBackup?.toLowerCase().trim() || "",
        emailStripe: input.emailStripe?.toLowerCase().trim() || "",
      },
    })

    return user
  }
)
