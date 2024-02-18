import db, { Checklist, ChecklistItem, Prisma } from "db"
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
    console.warn(`Checklist not found: ${checklistData.name}. Creating now.`)
    checklist = await db.checklist.create({
      data: { name: checklistData.name, version: checklistData.version },
      include: { checklistItems: true },
    })
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
  const newChecklistItemsWithIds = await db.checklistItem.findMany({
    where: {
      checklistId: checklist.id,
    },
  })

  if (newChecklistItemsWithIds.length == checklistData.items.length) {
    console.log(`Found new checklist item IDs for: ${checklistData.name}`)
  } else {
    throw new Error(`Checklist items count mismatch for: ${checklistData.name}`)
  }
  await updateUserChecklists(checklist, newChecklistItemsWithIds)
  console.log(`Done updating UserChecklistItems for: ${checklistData.name}`)
  return checklist
}

const updateUserChecklists = async (
  checklist: Checklist,
  newChecklistItemsWithIds: ChecklistItem[]
) => {
  const userChecklists = await db.userChecklist.findMany({
    where: {
      checklistId: checklist.id,
    },
  })

  for (const userChecklist of userChecklists) {
    await db.userChecklistItem.deleteMany({
      where: {
        userChecklistId: userChecklist.id,
      },
    })

    await db.userChecklistItem.createMany({
      data: newChecklistItemsWithIds.map((itemData) => ({
        userChecklistId: userChecklist.id,
        checklistItemId: itemData.id,
        userId: userChecklist.userId,
      })),
    })
  }
}
