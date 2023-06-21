import { z } from "zod"

export const CreateChecklistItemSchema = z.object({
  checklist: z.object({
    connect: z.object({
      id: z.number(),
    }),
  }),
  displayText: z.string(),
  isComplete: z.boolean(),
  user: z.string(),
  // template: __fieldName__: z.__zodType__(),
})
export const UpdateChecklistItemSchema = z.object({
  id: z.number(),
  isComplete: z.boolean(),
  // template: __fieldName__: z.__zodType__(),
})

export const DeleteChecklistItemSchema = z.object({
  id: z.number(),
})
