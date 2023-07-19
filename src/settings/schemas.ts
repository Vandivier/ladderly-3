import { z } from "zod"

export const optionalEmailValidator = z
  .string()
  .refine((value) => value === "" || value.includes("@"), {
    message: "Invalid email",
  })
  .nullable()
  .optional()

export const UpdateSettingsSchema = z.object({
  nameFirst: z.string().nullable().optional(),
  nameLast: z.string().nullable().optional(),
  email: z
    .string()
    .email()
    .refine((value) => value.trim().length > 0, {
      message: "Email cannot be empty",
    })
    .nullable()
    .optional(),
  emailBackup: optionalEmailValidator,
  emailStripe: optionalEmailValidator,
})
