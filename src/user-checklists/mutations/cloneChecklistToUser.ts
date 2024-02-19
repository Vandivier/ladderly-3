import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { Prisma } from "@prisma/client"
import { AuthenticationError } from "blitz"
import db from "db"
import { ChecklistWithItems } from "src/checklists/schemas"
import {
  UserChecklistItemWithChecklistItem,
  UserChecklistWithItems,
} from "../schemas"

export const cloneChecklistToUser = async (
  specificChecklist: ChecklistWithItems,
  userId: number
): Promise<UserChecklistWithItems> => {
  console.log(
    `Cloning checklist ${specificChecklist.id} to user: ${specificChecklist.id}`
  )
  const userChecklistItems: UserChecklistItemWithChecklistItem[] = []
  const newChecklist = await db.userChecklist.create({
    data: {
      userId,
      checklistId: specificChecklist.id,
    },
  })

  for (let checklistItem of specificChecklist.checklistItems) {
    const data: Prisma.UserChecklistItemCreateInput = {
      checklistItem: { connect: { id: checklistItem.id } },
      isComplete: false,
      user: { connect: { id: userId } },
      userChecklist: { connect: { id: newChecklist.id } },
    }

    const userChecklistItem = await db.userChecklistItem.create({
      data,
    })

    userChecklistItems.push({
      ...userChecklistItem,
      checklistItem,
    })
  }

  return { ...newChecklist, userChecklistItems }
}

export default resolver.pipe(
  resolver.authorize(),
  async ({ checklistId }: { checklistId: number }, ctx: Ctx) => {
    const { userId } = ctx.session

    if (!userId) throw new AuthenticationError()
    const checklist = await db.checklist.findUniqueOrThrow({
      where: { id: checklistId },
      include: { checklistItems: true },
    })

    const cloned = await cloneChecklistToUser(checklist, userId)
    return {
      userChecklist: cloned,
    }
  }
)
