import { z } from "zod"

export const CreateChecklistItemSchema = z.object({
  checklist: z.object({
    connect: z.object({
      id: z.number(),
    }),
  }),
  displayIndex: z.number(),
  displayText: z.string(),
  user: z.string(),
  // template: __fieldName__: z.__zodType__(),
})
export const UpdateChecklistItemSchema = z.object({
  id: z.number(),
  // template: __fieldName__: z.__zodType__(),
})

export const DeleteChecklistItemSchema = z.object({
  id: z.number(),
})
