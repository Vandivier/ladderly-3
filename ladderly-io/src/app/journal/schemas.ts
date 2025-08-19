import { z } from 'zod'

export const JournalEntryEnum = z.enum([
  'WIN',
  'PAIN_POINT',
  'LEARNING',
  'OTHER',
])

export type JournalEntryEnumType = z.infer<typeof JournalEntryEnum>
