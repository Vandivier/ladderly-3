import { z } from 'zod'

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
export const isValidOptionalEmail = (value: string) =>
  value === '' || emailRegex.test(value)

export const optionalEmailValidator = z
  .string()
  .refine(isValidOptionalEmail, {
    message: 'Invalid email',
  })
  .nullable()
  .optional()

export const uriValidator = z
  .string()
  .refine((value) => value === '' || value.startsWith('http'), {
    message: 'Invalid URI',
  })
  .nullable()
  .optional()

const optionalGitHubUriValidator = z
  .string()
  .refine((value) => value === '' || value.includes('github'), {
    message: 'Invalid GitHub URL',
  })
  .nullable()
  .optional()

const optionalLinkedInUriValidator = z
  .string()
  .refine((value) => value === '' || value.includes('linkedin'), {
    message: 'Invalid LinkedIn URL',
  })
  .nullable()
  .optional()

export const UpdateSettingsSchema = z.object({
  email: z.string().email(),
  emailBackup: optionalEmailValidator,
  emailStripe: optionalEmailValidator,

  hasInPersonEventInterest: z.boolean().default(false),
  hasLiveStreamInterest: z.boolean().default(false),
  hasOnlineEventInterest: z.boolean().default(false),
  hasOpenToWork: z.boolean().default(false),
  hasPublicProfileEnabled: z.boolean().default(false),
  hasShoutOutsEnabled: z.boolean().default(false),
  hasSmallGroupInterest: z.boolean().default(false),

  nameFirst: z.string().nullable().optional(),
  nameLast: z.string().nullable().optional(),
  profileBlurb: z.string().nullable().optional(),
  profileContactEmail: optionalEmailValidator,
  profileGitHubUri: optionalGitHubUriValidator,
  profileHomepageUri: uriValidator,
  profileLinkedInUri: optionalLinkedInUriValidator,
  profileTopServices: z.array(z.string()).default([]),
  residenceCountry: z.string().optional().default(''),
  residenceUSState: z.string().optional().default(''),
})
