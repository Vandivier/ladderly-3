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
): Promise<UserChecklistWithChecklistItems> => {
  if (userChecklist) {
    console.log(`Deleting malformed userChecklist: ${userChecklist.id}`)
    await db.userChecklistItem.deleteMany({ where: { userChecklistId: userChecklist.id } })
    await db.userChecklist.delete({ where: { id: userChecklist.id } })
  }

  console.log(`Cloning checklist ${specificChecklist.id} to user: ${specificChecklist.id}`)
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
): boolean => {
  if (!userChecklist) return true
  const specificChecklistItemTextSet = new Set(
    specificChecklist.checklistItems.map((item) => item.displayText)
  )
  const userChecklistItemTextSet = new Set(
    userChecklist.userChecklistItems.map((item) => item.checklistItem.displayText)
  )
  if (specificChecklistItemTextSet.size !== userChecklistItemTextSet.size) return true

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
      userChecklist = await cloneChecklistToUser(specificChecklist, userId, userChecklist)
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
