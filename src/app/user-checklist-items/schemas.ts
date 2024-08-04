import { z } from 'zod'

export const UpdateUserChecklistItemSchema = z.object({
  id: z.number(),
  isComplete: z.boolean(),
})
