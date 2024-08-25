import { SecurePassword } from '@blitzjs/auth/secure-password'
import db, { PaymentTierEnum } from 'db'
import { Role } from 'types'
import { Signup } from '../schemas'

export default async function signup(
  input: { password: string; email: string },
  ctx: any
) {
  // Extracting input and context
  const { email: inputEmail, password: inputPassword } = input
  const blitzContext = ctx

  // Input validation using zod schema
  const parsedInput = Signup.parse({
    email: inputEmail,
    password: inputPassword,
  })

  // Processing email and password
  const email = parsedInput.email.toLowerCase().trim()
  const password = parsedInput.password.trim()

  // Hashing password
  const hashedPassword = await SecurePassword.hash(password)

  // Creating user
  const user = await db.user.create({
    data: { email: email.toLowerCase().trim(), hashedPassword, role: 'USER' },
    select: { id: true, email: true, role: true },
  })

  // Creating user subscription
  await db.subscription.create({
    data: {
      tier: PaymentTierEnum.FREE,
      userId: user.id,
    },
  })

  // Creating session
  await blitzContext.session.$create({
    userId: user.id,
    role: user.role as Role,
  })

  // Returning user data
  return user
}
