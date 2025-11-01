import { z } from 'zod'
import { db } from '~/server/db'
import { Checklist, ChecklistItem, Prisma } from '@prisma/client'

const ChecklistItemObjectSchema = z.object({
  displayText: z.string(),
  detailText: z.string().default(''),
  isRequired: z.boolean().default(true),
  linkText: z.string().default(''),
  linkUri: z.string().default(''),
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
  checklistData: ChecklistSeedDataType,
) => {
  console.log(`Updating checklist: ${checklistData.name}`)

  let checklist = await db.checklist.findFirst({
    where: { name: checklistData.name },
    orderBy: { createdAt: 'desc' },
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
      `Checklist found but not returned by the updater: ${checklistData.name}`,
    )
  }

  const checklistItemCreateManyInput: Prisma.ChecklistItemCreateManyInput[] = []
  for (let i = 0; i < checklistData.items.length; i++) {
    const item = checklistData.items[i]
    const itemData = ChecklistItemObjectSchema.parse(
      typeof item === 'string' ? { displayText: item } : item,
    )

    checklistItemCreateManyInput.push({
      ...itemData,
      checklistId: checklist.id,
      displayIndex: i,
    })
  }

  // Create or update items one by one to handle cases where displayText matches
  // but other fields differ (the unique constraint is only on [displayText, checklistId])
  console.log(`Creating/updating items for: ${checklistData.name}`)
  for (const itemData of checklistItemCreateManyInput) {
    const existingItem = await db.checklistItem.findFirst({
      where: {
        checklistId: checklist.id,
        displayText: itemData.displayText,
      },
    })

    if (existingItem) {
      // Check if fields have changed - if so, update the item
      const hasChanged =
        existingItem.detailText !== itemData.detailText ||
        existingItem.isRequired !== itemData.isRequired ||
        existingItem.linkText !== itemData.linkText ||
        existingItem.linkUri !== itemData.linkUri ||
        existingItem.displayIndex !== itemData.displayIndex

      if (hasChanged) {
        await db.checklistItem.update({
          where: { id: existingItem.id },
          data: {
            detailText: itemData.detailText,
            isRequired: itemData.isRequired,
            linkText: itemData.linkText,
            linkUri: itemData.linkUri,
            displayIndex: itemData.displayIndex,
          },
        })
      }
    } else {
      // Create new item if it doesn't exist
      await db.checklistItem.create({
        data: itemData,
      })
    }
  }
  console.log(`Done creating/updating items for: ${checklistData.name}`)

  // Refresh checklist with updated items before checking for obsolete items
  const refreshedChecklist = await db.checklist.findUnique({
    where: { id: checklist.id },
    include: { checklistItems: true },
  })

  if (!refreshedChecklist) {
    throw new Error(`Checklist not found after update: ${checklistData.name}`)
  }

  const checklistItems = await deleteObsoleteChecklistItems(
    refreshedChecklist,
    checklistItemCreateManyInput,
  )
  console.log(`deleteObsoleteChecklistItems done for: ${checklistData.name}`)
  await updateUserChecklists(checklist, checklistItems)
  console.log(`updateUserChecklists done for: ${checklistData.name}`)

  return checklist
}

const updateUserChecklists = async (
  checklist: Checklist,
  checklistItems: ChecklistItem[],
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
  newChecklistItemsData: Prisma.ChecklistItemCreateManyInput[],
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
    }),
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
        `Found: ${actualItemCount}`,
    )
  }

  return checklistItemsWithIds
}
