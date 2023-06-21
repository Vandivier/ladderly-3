import { z } from "zod"

export const CreateChecklistItemSchema = z.object({
  displayText: z.string(),
  isComplete: z.boolean(),
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
