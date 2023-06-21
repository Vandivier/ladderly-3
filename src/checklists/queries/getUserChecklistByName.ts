import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { AuthenticationError } from "blitz"
import db from "db"

export default resolver.pipe(resolver.authorize(), async ({ name }: { name: string }, ctx: Ctx) => {
  const { userId } = ctx.session

  if (!userId) throw new AuthenticationError()

  // Fetch the generic checklist.
  const genericChecklist = await db.checklist.findFirst({
    where: { name },
  })

  if (!genericChecklist) throw new Error("Generic checklist not found")

  const userChecklist = await db.userChecklist.findFirst({
    where: { userId, checklistId: genericChecklist.id },
    include: { checklist: { include: { checklistItems: true } } },
  })

  if (!userChecklist) {
    const newUserChecklist = await db.userChecklist.create({
      data: {
        userId,
        checklistId: genericChecklist.id,
      },
      include: { checklist: { include: { checklistItems: true } } },
    })
    return newUserChecklist
  }

  return userChecklist
})
