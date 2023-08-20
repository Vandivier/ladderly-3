import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { AuthenticationError } from "blitz"
import db, { Prisma } from "db"

import { UserChecklistByNameData, UserChecklistItemWithChecklistItem } from "../schemas"

export default resolver.pipe(
  resolver.authorize(),
  async (
    {
      name,
      version,
      shouldCreateIfNull = false,
    }: { name: string; version?: string; shouldCreateIfNull?: boolean },
    ctx: Ctx
  ): Promise<null | UserChecklistByNameData> => {
    const { userId } = ctx.session

    if (!userId) throw new AuthenticationError()
    // Version is an ISO date string
    // so, we can sort lexicographically
    const checklists = await db.checklist.findMany({
      include: { checklistItems: { orderBy: { displayIndex: "asc" } } },
      orderBy: { version: "desc" },
      where: { name },
    })
    const latestChecklist = checklists[0]
    const specificChecklist = version
      ? checklists.find((checklist) => checklist.version === version)
      : latestChecklist

    if (!specificChecklist || !latestChecklist) throw new Error("Checklist not found")
    const userChecklistItems: UserChecklistItemWithChecklistItem[] = []
    const userChecklistWhere: Prisma.UserChecklistWhereUniqueInput = {
      userId_checklistId: { userId, checklistId: specificChecklist.id },
    }
    let userChecklist = await db.userChecklist.findUnique({
      where: userChecklistWhere,
      include: { userChecklistItems: { include: { checklistItem: true } } },
    })

    if (!userChecklist && shouldCreateIfNull) {
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

      userChecklist = { ...newChecklist, userChecklistItems }
    } else if (!userChecklist) {
      return null
    }

    const isLatestVersion = latestChecklist && specificChecklist.version === latestChecklist.version
    const data: UserChecklistByNameData = {
      checklist: specificChecklist,
      latestChecklist,
      isLatestVersion: isLatestVersion ?? false,
      userChecklistWithChecklistItems: userChecklist,
    }

    return data
  }
)
