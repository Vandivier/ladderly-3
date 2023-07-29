import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { AuthenticationError } from "blitz"
import db, { Checklist, ChecklistItem, Prisma, UserChecklist, UserChecklistItem } from "db"

export type UserChecklistItemWithChecklistItem = UserChecklistItem & {
  checklistItem: ChecklistItem
}

export type UserChecklistWithChecklistItems = UserChecklist & {
  userChecklistItems: (UserChecklistItem & {
    checklistItem: ChecklistItem
  })[]
}

export type UserChecklistByNameData = {
  checklist: Checklist
  userChecklistItemsWithChecklistItem: UserChecklistItemWithChecklistItem[]
  userChecklistWithChecklistItems: UserChecklistWithChecklistItems
}

export default resolver.pipe(
  resolver.authorize(),
  async (
    { name, version }: { name: string; version?: string },
    ctx: Ctx
  ): Promise<UserChecklistByNameData> => {
    const { userId } = ctx.session

    if (!userId) throw new AuthenticationError()

    let checklist
    if (version) {
      checklist = await db.checklist.findFirst({
        include: { checklistItems: true },
        where: {
          name,
          version,
        },
      })
    } else {
      const checklists = await db.checklist.findMany({
        where: { name },
      })

      checklist = checklists.sort(
        (a, b) => new Date(b.version).getTime() - new Date(a.version).getTime()
      )[0]
    }

    if (!checklist) throw new Error("Checklist not found")
    let userChecklistItems: UserChecklistItemWithChecklistItem[] = []
    const userChecklistWhere: Prisma.UserChecklistWhereUniqueInput = {
      userId_checklistId: { userId, checklistId: checklist.id },
    }

    let userChecklist = await db.userChecklist.findUnique({
      where: userChecklistWhere,
      include: { userChecklistItems: { include: { checklistItem: true } } },
    })

    if (!userChecklist) {
      const newChecklist = await db.userChecklist.create({
        data: {
          userId,
          checklistId: checklist.id,
        },
      })

      for (let checklistItem of checklist.checklistItems) {
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

      userChecklist = { ...newChecklist, userChecklistItems }
    } else {
      userChecklistItems = userChecklist.userChecklistItems.map((item) => ({ ...item }))
    }

    userChecklistItems.sort((a, b) => a.checklistItem.displayIndex - b.checklistItem.displayIndex)
    const data: UserChecklistByNameData = {
      checklist,
      userChecklistItemsWithChecklistItem: userChecklistItems,
      userChecklistWithChecklistItems: userChecklist,
    }

    return data
  }
)
