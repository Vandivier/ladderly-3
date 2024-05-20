import { Ctx } from "blitz"
import db from "db"

export default async function getCurrentUser(_: null, ctx: Ctx) {
  if (!ctx.session.userId) return null
  const user = await db.user.findFirst({
    where: { id: ctx.session.userId },
    select: {
      id: true,
      nameFirst: true,
      nameLast: true,
      email: true,
      emailBackup: true,
      emailStripe: true,
      role: true,
      subscriptions: true,
    },
  })

  return user
}
