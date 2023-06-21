import { z } from "zod"

export const CreateChecklistSchema = z.object({
  name: z.string(),
  user: z.string(),
  item: z.string(),
  isComplete: z.boolean(),
  // template: __fieldName__: z.__zodType__(),
})
export const UpdateChecklistSchema = z.object({
  id: z.number(),
  // template: __fieldName__: z.__zodType__(),
})

export const DeleteChecklistSchema = z.object({
  id: z.number(),
})
