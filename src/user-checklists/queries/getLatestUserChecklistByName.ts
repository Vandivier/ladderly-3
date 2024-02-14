import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { AuthenticationError } from "blitz"
import db, { Prisma } from "db"

import { ChecklistWithItems } from "src/checklists/schemas"
import {
  UserChecklistByNameData,
  UserChecklistItemWithChecklistItem,
  UserChecklistWithChecklistItems,
} from "../schemas"

const cloneChecklistToUser = async (
  specificChecklist: ChecklistWithItems,
  userId: number,
  userChecklist: null | UserChecklistWithChecklistItems
) => {
  // TODO: cascade delete userChecklist if exists
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

const getIsUserChecklistMalformed = (
  userChecklist: null | UserChecklistWithChecklistItems,
  specificChecklist: ChecklistWithItems
) => {
  // const isUserChecklistMalformed = specificChecklist.checklistItems.reduce(
  //   (acc, el, i) =>
  //     acc || el.displayText !== userChecklist?.userChecklistItems[i].checklistItem.displayText,
  //   false
  // )
  throw new Error("Not implemented")
}

export default resolver.pipe(
  resolver.authorize(),
  async (
    {
      name,
      version,
      shouldUpsertIfMalformed = false,
    }: { name: string; version?: string; shouldUpsertIfMalformed?: boolean },
    ctx: Ctx
  ): Promise<UserChecklistByNameData> => {
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
    const userChecklistWhere: Prisma.UserChecklistWhereUniqueInput = {
      userId_checklistId: { userId, checklistId: specificChecklist.id },
    }
    let userChecklist: null | UserChecklistWithChecklistItems = await db.userChecklist.findUnique({
      where: userChecklistWhere,
      include: { userChecklistItems: { include: { checklistItem: true } } },
    })

    if (shouldUpsertIfMalformed && getIsUserChecklistMalformed(userChecklist, specificChecklist)) {
      await cloneChecklistToUser(specificChecklist, userId, userChecklist)
      // userChecklist = await db.userChecklist.findUnique({
      //   where: userChecklistWhere,
      //   include: { userChecklistItems: { include: { checklistItem: true } } },
      // })
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
