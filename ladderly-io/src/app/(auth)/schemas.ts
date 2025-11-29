import { z } from 'zod'

export const email = z
  .string()
  .email()
  .transform((str) => str.toLowerCase().trim())

// Password complexity requirements:
// - At least 10 characters
// - At least one uppercase letter
// - At least one lowercase letter
// - At least one number
// - At least one special character
export const password = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .max(100, 'Password must be at most 100 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
  .transform((str) => str.trim())

export const PASSWORD_REQUIREMENTS = [
  'At least 10 characters',
  'At least one uppercase letter (A-Z)',
  'At least one lowercase letter (a-z)',
  'At least one number (0-9)',
  'At least one special character (!@#$%^&*...)',
]

export const Signup = z.object({
  email,
  password,
})

export const Login = z.object({
  email,
  password: z.string(),
})

export const ForgotPassword = z.object({
  email,
})

export const ResetPassword = z
  .object({
    password: password,
    passwordConfirmation: password,
    token: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ['passwordConfirmation'], // set the path of the error
  })

export const ChangePassword = z.object({
  currentPassword: z.string(),
  newPassword: password,
})
