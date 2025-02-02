import { PaymentTierEnum, type Subscription, type User } from '@prisma/client'
import { z } from 'zod'
import { NULL_RESULT_TRPC_INT } from './constants'

export const tiersOrder = {
  FREE: 0,
  PAY_WHAT_YOU_CAN: 1,
  PREMIUM: 2,
} as const

const lowercaseStringList = z
  .array(z.string())
  .transform((val) => val?.map((reason) => reason.toLowerCase()))

// Define the settings input type
export const UpdateUserSettingsSchema = z.object({
  email: z.string(),
  emailBackup: z.string().optional(),
  emailStripe: z.string().optional(),
  hasInPersonEventInterest: z.boolean(),
  hasLiveStreamInterest: z.boolean(),
  hasOnlineEventInterest: z.boolean(),
  hasOpenToRelocation: z.boolean(),
  hasOpenToWork: z.boolean(),
  hasPublicProfileEnabled: z.boolean(),
  hasShoutOutsEnabled: z.boolean(),
  hasSmallGroupInterest: z.boolean(),
  nameFirst: z.string().nullable(),
  nameLast: z.string().nullable(),
  profileBlurb: z.string().nullable(),
  profileContactEmail: z.string().nullable(),
  profileCurrentJobCompany: z.string().optional(),
  profileCurrentJobTitle: z.string().optional(),
  profileGitHubUri: z.string().nullable(),
  profileHighestDegree: z.string().nullable(),
  profileHomepageUri: z.string().nullable(),
  profileLinkedInUri: z.string().nullable(),
  profileTopNetworkingReasons: lowercaseStringList,
  profileTopServices: lowercaseStringList,
  profileTopSkills: lowercaseStringList,
  profileYearsOfExperience: z.number().nullable(),
  residenceCountry: z.string(),
  residenceUSState: z.string(),
})

// Define the settings output type
export const GetUserSettingsSchema = UpdateUserSettingsSchema.extend({
  id: z.number(),
  emailBackup: z.string().nullable(),
  emailStripe: z.string().optional(),
  nameFirst: z.string().nullable(),
  nameLast: z.string().nullable(),
  profileBlurb: z.string().nullable(),
  profileContactEmail: z.string().nullable(),
  profileCurrentJobCompany: z.string().nullable(),
  profileCurrentJobTitle: z.string().nullable(),
  profileGitHubUri: z.string().nullable(),
  profileHighestDegree: z.string().nullable(),
  profileHomepageUri: z.string().nullable(),
  profileLinkedInUri: z.string().nullable(),
  profileTopNetworkingReasons: z.array(z.string()).nullable(),
  profileTopServices: z.array(z.string()).nullable(),
  profileTopSkills: z.array(z.string()).nullable(),
  profileYearsOfExperience: z.number().nullable(),
  subscription: z.object({
    tier: z.nativeEnum(PaymentTierEnum),
    type: z.string(),
  }),
})

export const UserSettingsFormValues = GetUserSettingsSchema.extend({
  profileYearsOfExperience: z
    .number()
    .nullable()
    .optional()
    .transform((val) => (val === null ? '' : String(val))),
})

export type UserSettingsFormValuesType = z.infer<typeof UserSettingsFormValues>
export type UserSettings = z.infer<typeof GetUserSettingsSchema>
export type UserWithSubscriptions = User & { subscriptions: Subscription[] }
export type UserWithSubscriptionsOrZero =
  | UserWithSubscriptions
  | typeof NULL_RESULT_TRPC_INT
