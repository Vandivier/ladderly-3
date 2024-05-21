import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { AuthenticationError } from "blitz"
import db from "db"

import { ChecklistWithItems } from "src/app/checklists/schemas"
import { cloneChecklistToUser } from "../mutations/createUserChecklistAsClone"
import { UserChecklistByNameData, UserChecklistWithItems } from "../schemas"

type LatestUserChecklistType =
  | null
  | (UserChecklistWithItems & {
      checklist: ChecklistWithItems
    })

const isUserChecklistMalformed = (
  userChecklist: UserChecklistWithItems,
  specificChecklist: ChecklistWithItems
): boolean => {
  const specificChecklistItemTextSet = new Set(
    specificChecklist.checklistItems.map((item) => item.displayText)
  )
  const userChecklistItemTextSet = new Set(
    userChecklist.userChecklistItems.map(
      (item) => item.checklistItem.displayText
    )
  )
  if (specificChecklistItemTextSet.size !== userChecklistItemTextSet.size)
    return true

  for (const item of specificChecklist.checklistItems) {
    const matchingItem = userChecklist.userChecklistItems.find(
      (userItem) => userItem.checklistItem.displayText === item.displayText
    )
    if (!matchingItem) return true
    if (matchingItem.checklistItem.linkText !== item.linkText) return true
    if (matchingItem.checklistItem.linkUri !== item.linkUri) return true
  }

  return false
}

export default resolver.pipe(
  resolver.authorize(),
  async (
    { name }: { name: string },
    ctx: Ctx
  ): Promise<UserChecklistByNameData> => {
    const { userId } = ctx.session
    if (!userId) throw new AuthenticationError()
    const latestChecklist = await db.checklist.findFirst({
      include: { checklistItems: { orderBy: { displayIndex: "asc" } } },
      orderBy: { createdAt: "desc" },
      where: { name },
    })
    if (!latestChecklist) throw new Error(`Checklist not found: ${name}`)
    const allUserChecklist: LatestUserChecklistType[] =
      await db.userChecklist.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          checklist: {
            include: { checklistItems: { orderBy: { displayIndex: "asc" } } },
          },
          userChecklistItems: { include: { checklistItem: true } },
        },
      })

    const latestUserChecklist: LatestUserChecklistType =
      (allUserChecklist.length > 0 &&
        allUserChecklist.find(
          (userChecklist) =>
            userChecklist && userChecklist.checklist.name === name
        )) ||
      null

    if (
      !latestUserChecklist ||
      isUserChecklistMalformed(
        latestUserChecklist,
        latestUserChecklist.checklist
      )
    ) {
      if (latestUserChecklist) {
        console.log(
          `Deleting malformed userChecklist: ${latestUserChecklist.id}`
        )
        await db.userChecklistItem.deleteMany({
          where: { userChecklistId: latestUserChecklist.id },
        })
        await db.userChecklist.delete({ where: { id: latestUserChecklist.id } })
      }

      const cloned = await cloneChecklistToUser(latestChecklist, userId)

      return {
        latestChecklistId: latestChecklist.id,
        userChecklistCascade: {
          checklist: latestChecklist,
          userChecklist: cloned,
        },
      }
    }

    return {
      latestChecklistId: latestChecklist.id,
      userChecklistCascade: {
        checklist: latestChecklist,
        userChecklist: latestUserChecklist,
      },
    }
  }
)
