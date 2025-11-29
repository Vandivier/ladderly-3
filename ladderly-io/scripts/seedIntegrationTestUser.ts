/**
 * Seeds a verified test user for integration tests.
 * Run after prisma db push in the integration test environment.
 */
import { PrismaClient } from '@prisma/client'
import * as argon2 from 'argon2'

const prisma = new PrismaClient()

const TEST_USER = {
  email: 'verified-test-user@example.com',
  password: 'TestP@ssword123',
  name: 'Verified Test User',
}

async function main() {
  console.log('Seeding integration test user...')

  // Hash the password with argon2 (same as better-auth uses)
  const hashedPassword = await argon2.hash(TEST_USER.password)

  // Create the user with verified email
  const user = await prisma.user.create({
    data: {
      email: TEST_USER.email,
      name: TEST_USER.name,
      emailVerified: true,
      emailVerifiedDate: new Date(),
    },
  })

  // Create the credential account with the password
  await prisma.account.create({
    data: {
      userId: user.id,
      provider: 'credential',
      providerAccountId: TEST_USER.email,
      password: hashedPassword,
    },
  })

  console.log(`Created verified test user: ${TEST_USER.email}`)
  console.log(`Password: ${TEST_USER.password}`)
}

main()
  .catch((e) => {
    console.error('Failed to seed integration test user:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
