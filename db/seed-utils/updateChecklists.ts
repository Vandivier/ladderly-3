import db, { Prisma } from "db"
import { z } from "zod"

const ChecklistItemObjectSchema = z.object({
  displayText: z.string(),
  detailText: z.string().default(""),
  isRequired: z.boolean().default(true),
  linkText: z.string().default(""),
  linkUri: z.string().default(""),
})

const ChecklistItemSchema = z.union([ChecklistItemObjectSchema, z.string()])
const ChecklistSchema = z.object({
  name: z.string(),
  version: z.string(),
  items: z.array(ChecklistItemSchema),
})

export type ChecklistSeedDataType = z.infer<typeof ChecklistSchema>

export const ChecklistsSchema = z.array(ChecklistSchema)

export const updateChecklistsInPlace = async (checklistData: ChecklistSeedDataType) => {
  console.log(`Updating checklist: ${checklistData.name}`)

  let checklist = await db.checklist.findFirst({
    where: { name: checklistData.name },
    orderBy: { createdAt: "desc" },
    include: { checklistItems: true },
  })

  if (checklist === null) {
    throw new Error(`Attempted to update a checklist, but it wasn't found: ${checklistData.name}`)
  }

  checklist = await db.checklist.update({
    where: { id: checklist.id },
    data: { version: checklistData.version },
    include: { checklistItems: true },
  })

  if (checklist === null) {
    throw new Error(`Checklist found but not returned by the updater: ${checklistData.name}`)
  }

  // collect data for later bulk operations
  const newChecklistItemsData: Prisma.ChecklistItemCreateManyInput[] = []
  const newUserChecklistItemsData: Prisma.UserChecklistItemCreateManyInput[] = []
  for (let i = 0; i < checklistData.items.length; i++) {
    const item = checklistData.items[i]
    const itemData = ChecklistItemObjectSchema.parse(
      typeof item === "string" ? { displayText: item } : item
    )

    const existingItem = checklist.checklistItems.find(
      (ci) => ci.displayText === itemData.displayText
    )

    if (existingItem) {
      await db.checklistItem.update({
        where: { id: existingItem.id },
        data: { ...itemData, displayIndex: i },
      })
    } else {
      newChecklistItemsData.push({
        ...itemData,
        checklistId: checklist.id,
        displayIndex: i,
      })
    }
  }

  console.log(`Done updating existing items for: ${checklistData.name}`)
  await db.checklistItem.createMany({
    data: newChecklistItemsData,
  })
  console.log(`Done creating new items for: ${checklistData.name}`)
  // TODO: remove obsolete ChecklistItems
  // TODO: new checklist items are not being added as userchecklist items, eg 407 and 408.
  // need to hard-purge the userchecklistitems for the checklist and re-add them
  // related: newUserChecklistItemsData is not being used
  await updateUserChecklists(checklist.id, newChecklistItemsData)
  console.log(`Done updating UserChecklistItems for: ${checklistData.name}`)
  // TODO: remove obsolete UserChecklistItems

  return checklist
}

const updateUserChecklists = async (
  checklistId: number,
  newChecklistItemsData: Prisma.ChecklistItemCreateManyInput[]
) => {
  const createdChecklistItems = await db.checklistItem.findMany({
    where: {
      checklistId: checklistId,
      displayText: { in: newChecklistItemsData.map((item) => item.displayText) },
    },
  })

  const displayTextToIdMap = createdChecklistItems.reduce((acc, item) => {
    acc[item.displayText] = item.id
    return acc
  }, {} as Record<string, number>)

  // Prepare UserChecklistItems for bulk creation or update
  const newUserChecklistItemsData: Prisma.UserChecklistItemCreateManyInput[] = []
  const userChecklists = await db.userChecklist.findMany({
    where: { checklistId: checklistId },
  })
  for (const newItem of newChecklistItemsData) {
    const checklistItemId = displayTextToIdMap[newItem.displayText]
    if (checklistItemId === undefined) continue

    userChecklists.forEach((userChecklist) => {
      newUserChecklistItemsData.push({
        userChecklistId: userChecklist.id,
        userId: userChecklist.userId,
        checklistItemId: checklistItemId,
        isComplete: false,
      })
    })
  }

  await db.userChecklistItem.createMany({
    data: newUserChecklistItemsData,
  })
}
