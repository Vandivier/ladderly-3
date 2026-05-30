import { z } from 'zod'

export const JournalEntryEnum = z.enum([
  'WIN',
  'PAIN_POINT',
  'LEARNING',
  'OTHER',
  'TASK',
])

export type JournalEntryEnumType = z.infer<typeof JournalEntryEnum>
