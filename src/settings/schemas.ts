import { z } from "zod"

export const optionalEmailValidator = z
  .string()
  .refine((value) => value === "" || value.includes("@"), {
    message: "Invalid email",
  })
  .nullable()
  .optional()

export const uriValidator = z
  .string()
  .refine((value) => value === "" || value.startsWith("http"), {
    message: "Invalid URI",
  })
  .nullable()
  .optional()

const optionalGitHubUriValidator = z
  .string()
  .refine((value) => value === "" || value.includes("github"), { message: "Invalid GitHub URL" })
  .nullable()
  .optional()

const optionalLinkedInUriValidator = z
  .string()
  .refine((value) => value === "" || value.includes("linkedin"), {
    message: "Invalid LinkedIn URL",
  })
  .nullable()
  .optional()

export const UpdateSettingsSchema = z.object({
  email: z.string().email(),
  emailBackup: optionalEmailValidator,
  emailStripe: optionalEmailValidator,

  hasInPersonEventInterest: z.boolean().optional(),
  hasLiveStreamInterest: z.boolean().optional(),
  hasOnlineEventInterest: z.boolean().optional(),
  hasOpenToWork: z.boolean().optional(),
  hasPublicProfileEnabled: z.boolean().optional(),
  hasShoutOutsEnabled: z.boolean().optional(),
  hasSmallGroupInterest: z.boolean().optional(),

  nameFirst: z.string().nullable().optional(),
  nameLast: z.string().nullable().optional(),
  profileBlurb: z.string().nullable().optional(),
  profileContactEmail: optionalEmailValidator,
  profileGitHubUri: optionalGitHubUriValidator,
  profileHomepageUri: uriValidator,
  profileLinkedInUri: optionalLinkedInUriValidator,
  residenceCountry: z.string().optional(),
  residenceUSState: z.string().optional(),
})
