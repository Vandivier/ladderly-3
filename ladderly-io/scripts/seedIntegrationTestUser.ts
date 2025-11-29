/// <reference types="node" />
/**
 * Seeds a verified test user for integration tests.
 * Run after prisma db push and the app is built, before tests run.
 *
 * Uses the sign-up API so better-auth creates the password hash correctly,
 * then manually verifies the email in the database.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TEST_USER = {
  email: 'verified-test-user@example.com',
  password: 'TestP@ssword123',
  name: 'Verified Test User',
}

const APP_ORIGIN = process.env.APP_ORIGIN ?? 'http://127.0.0.1:3000'

async function waitForServer(maxAttempts = 30): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${APP_ORIGIN}/api/auth/get-session`)
      if (response.ok || response.status === 401) {
        return true
      }
    } catch {
      // Server not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  return false
}

async function main() {
  console.log('Seeding integration test user...')

  // Check if user already exists (in case of retry)
  const existingUser = await prisma.user.findUnique({
    where: { email: TEST_USER.email },
  })

  if (existingUser) {
    console.log('Test user already exists, ensuring email is verified...')
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        emailVerified: true,
        emailVerifiedDate: new Date(),
      },
    })
    console.log('Test user email verified.')
    return
  }

  // Wait for server to be ready
  console.log('Waiting for server to be ready...')
  const serverReady = await waitForServer()
  if (!serverReady) {
    throw new Error('Server did not become ready in time')
  }

  // Use the sign-up API so better-auth creates the password hash
  console.log('Creating user via sign-up API...')
  const signUpResponse = await fetch(`${APP_ORIGIN}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: TEST_USER.email,
      password: TEST_USER.password,
      name: TEST_USER.name,
    }),
  })

  if (!signUpResponse.ok) {
    const errorText = await signUpResponse.text()
    throw new Error(`Sign-up failed: ${signUpResponse.status} ${errorText}`)
  }

  console.log('User created via API, now verifying email in database...')

  // Find the user and verify their email
  const user = await prisma.user.findUnique({
    where: { email: TEST_USER.email },
  })

  if (!user) {
    throw new Error('User was not created')
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerifiedDate: new Date(),
    },
  })

  // Verify the setup
  const verifiedUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { email: true, emailVerified: true, emailVerifiedDate: true },
  })

  const account = await prisma.account.findFirst({
    where: { userId: user.id, provider: 'credential' },
    select: { id: true, provider: true, password: true },
  })

  console.log(`Created verified test user: ${TEST_USER.email}`)
  console.log(`User ID: ${user.id}`)
  console.log(`emailVerified: ${verifiedUser?.emailVerified}`)
  console.log(`emailVerifiedDate: ${verifiedUser?.emailVerifiedDate}`)
  console.log(`Account ID: ${account?.id}`)
  console.log(`Provider: ${account?.provider}`)
  console.log(`Has password: ${!!account?.password}`)
}

main()
  .catch((e) => {
    console.error('Failed to seed integration test user:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
