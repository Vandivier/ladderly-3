import { z } from "zod"

export const UpdateSettingsSchema = z.object({
  nameFirst: z.string().optional(),
  nameLast: z.string().optional(),
  email: z
    .string()
    .email()
    .refine((value) => value.trim().length > 0, {
      message: "Email cannot be empty",
    })
    .optional(),
  emailBackup: z.string().email().optional(),
  emailStripe: z.string().email().optional(),
})
