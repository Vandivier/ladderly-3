import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { AuthenticationError } from "blitz"
import db from "db"

export default resolver.pipe(
  resolver.authorize(),
  async ({ checklistId }: { checklistId: number }, ctx: Ctx) => {
    const { userId } = ctx.session

    if (!userId) throw new AuthenticationError()

    // Get the checklist with its items
    const checklist = await db.checklist.findUnique({
      where: { id: checklistId },
      include: { checklistItems: true },
    })

    if (!checklist) throw new Error("Checklist not found")

    // Create the user checklist
    const userChecklist = await db.userChecklist.create({
      data: {
        user: { connect: { id: userId } },
        checklist: { connect: { id: checklist.id } },
      },
    })

    // For each checklist item, create a corresponding user checklist item
    for (let checklistItem of checklist.checklistItems) {
      await db.userChecklistItem.create({
        data: {
          isComplete: false,
          checklistItem: { connect: { id: checklistItem.id } },
          userChecklist: { connect: { id: userChecklist.id } },
          user: { connect: { id: userId } },
        },
      })
    }

    return userChecklist
  }
)
