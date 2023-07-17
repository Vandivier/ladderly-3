import { z } from "zod"

export const CreateChecklistSchema = z.object({
  isComplete: z.boolean(),
  item: z.string(),
  name: z.string(),
  user: z.string(),
  version: z.string(),
  // template: __fieldName__: z.__zodType__(),
})
export const UpdateChecklistSchema = z.object({
  id: z.number(),
  // template: __fieldName__: z.__zodType__(),
})

export const DeleteChecklistSchema = z.object({
  id: z.number(),
})
