import db, { Checklist, ChecklistItem, Prisma } from "db"
import { r } from "vitest/dist/index-9f5bc072"
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

export const updateChecklistsInPlace = async (
  checklistData: ChecklistSeedDataType
) => {
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
    throw new Error(
      `Checklist found but not returned by the updater: ${checklistData.name}`
    )
  }

  const checklistItemCreateManyInput: Prisma.ChecklistItemCreateManyInput[] = []
  for (let i = 0; i < checklistData.items.length; i++) {
    const item = checklistData.items[i]
    const itemData = ChecklistItemObjectSchema.parse(
      typeof item === "string" ? { displayText: item } : item
    )

    checklistItemCreateManyInput.push({
      ...itemData,
      checklistId: checklist.id,
      displayIndex: i,
    })
  }

  console.log(`Done updating existing items for: ${checklistData.name}`)
  await db.checklistItem.createMany({
    data: checklistItemCreateManyInput,
    skipDuplicates: true,
  })
  console.log(`Done creating new items for: ${checklistData.name}`)

  const checklistItems = await deleteObsoleteChecklistItems(
    checklist,
    checklistItemCreateManyInput
  )
  console.log(`deleteObsoleteChecklistItems done for: ${checklistData.name}`)
  await updateUserChecklists(checklist, checklistItems)
  console.log(`updateUserChecklists done for: ${checklistData.name}`)

  return checklist
}

const updateUserChecklists = async (
  checklist: Checklist,
  checklistItems: ChecklistItem[]
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
      data: checklistItems.map((itemData) => ({
        userChecklistId: userChecklist.id,
        checklistItemId: itemData.id,
        userId: userChecklist.userId,
      })),
    })
  }
}

const deleteObsoleteChecklistItems = async (
  checklist: Checklist & { checklistItems: ChecklistItem[] },
  newChecklistItemsData: Prisma.ChecklistItemCreateManyInput[]
): Promise<ChecklistItem[]> => {
  const newItemsSet = new Set(
    newChecklistItemsData.map((item) => {
      return (
        item.displayText +
        item.detailText +
        item.isRequired +
        item.linkText +
        item.linkUri
      )
    })
  )

  const obsoleteChecklistItems: ChecklistItem[] =
    checklist.checklistItems.filter((item) => {
      const currCompoundKey =
        item.displayText +
        item.detailText +
        item.isRequired +
        item.linkText +
        item.linkUri

      return !newItemsSet.has(currCompoundKey)
    })

  if (obsoleteChecklistItems.length > 0) {
    const idsToDelete = obsoleteChecklistItems.map((item) => item.id)
    await db.userChecklistItem.deleteMany({
      where: {
        checklistItemId: {
          in: idsToDelete,
        },
      },
    })
    await db.checklistItem.deleteMany({
      where: {
        id: {
          in: idsToDelete,
        },
      },
    })
  }

  const checklistItemsWithIds = await db.checklistItem.findMany({
    where: {
      checklistId: checklist.id,
    },
  })

  const expectedItemCount = newChecklistItemsData.length
  const actualItemCount = checklistItemsWithIds.length
  if (expectedItemCount !== actualItemCount) {
    throw new Error(
      `Checklist items count mismatch for: ${checklist.name}.\n` +
        `Expected: ${expectedItemCount}, ` +
        `Found: ${actualItemCount}`
    )
  }

  return checklistItemsWithIds
}
