import db from "db"
import { z } from "zod"

const ChecklistItemObjectSchema = z.object({
  detailText: z.string(),
  displayText: z.string(),
  isRequired: z.boolean(),
  linkText: z.string(),
  linkUri: z.string(),
})

const ChecklistItemSchema = z.union([ChecklistItemObjectSchema, z.string()])
const ChecklistSchema = z.object({
  name: z.string(),
  version: z.string(),
  items: z.array(ChecklistItemSchema),
})

export type ChecklistSeedDataType = z.infer<typeof ChecklistSchema>

export const ChecklistsSchema = z.array(ChecklistSchema)

export const updateLatestChecklists = async (checklistData: ChecklistSeedDataType) => {
  let checklist = await db.checklist.findFirst({
    where: { name: checklistData.name },
    orderBy: { createdAt: "desc" },
  })

  if (checklist) {
    checklist = await db.checklist.update({
      where: { id: checklist.id },
      data: { version: checklistData.version },
    })
  }

  return checklist
}
