import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { AuthenticationError } from "blitz"
import db, { Checklist, ChecklistItem, Prisma, UserChecklist } from "db"

type UserChecklistWithChecklistItems = UserChecklist & {
  checklist: Checklist & { checklistItems: ChecklistItem[] }
}

export default resolver.pipe(
  resolver.authorize(),
  async ({ name }: { name: string }, ctx: Ctx): Promise<UserChecklistWithChecklistItems> => {
    const { userId } = ctx.session

    if (!userId) throw new AuthenticationError()

    const genericChecklist = await db.checklist.findFirst({
      where: { name },
    })

    if (!genericChecklist) throw new Error("Generic checklist not found")

    const includeChecklistItems: Prisma.ChecklistInclude = {
      checklistItems: { orderBy: { displayIndex: "asc" } },
    }
    const userChecklist = await db.userChecklist.findFirst({
      where: { userId, checklistId: genericChecklist.id },
      include: { checklist: { include: includeChecklistItems } },
    })

    if (!userChecklist) {
      const newUserChecklist = await db.userChecklist.create({
        data: {
          userId,
          checklistId: genericChecklist.id,
        },
        include: { checklist: { include: includeChecklistItems } },
      })
      return newUserChecklist as UserChecklistWithChecklistItems
    }

    return userChecklist as UserChecklistWithChecklistItems
  }
)
