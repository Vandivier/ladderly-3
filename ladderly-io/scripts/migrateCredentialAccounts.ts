// run like `node --experimental-strip-types scripts/migrateCredentialAccounts.ts`
// This script ensures credential accounts are properly set up for better-auth:
// 1. Deletes invalid credential accounts (providerAccountId not an email)
// 2. Creates/updates credential accounts with correct providerAccountId (email) and password
// 3. Normalizes provider from 'credentials' to 'credential'

import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure dotenv
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function migrateCredentialAccounts(): Promise<void> {
  try {
    // Step 1: Delete invalid credential accounts (providerAccountId is not an email)
    const invalidAccounts = await prisma.account.deleteMany({
      where: {
        provider: { in: ['credential', 'credentials'] },
        NOT: { providerAccountId: { contains: '@' } },
      },
    })
    console.log(
      `Step 1: Deleted ${invalidAccounts.count} invalid credential accounts (non-email providerAccountId)`,
    )

    // Step 2: Find all users with a hashedPassword (credential users)
    const usersWithPassword = await prisma.user.findMany({
      where: {
        hashedPassword: { not: null },
      },
      select: {
        id: true,
        email: true,
        hashedPassword: true,
      },
    })

    console.log(
      `Step 2: Found ${usersWithPassword.length} users with credential passwords to migrate`,
    )

    let createdCount = 0
    let updatedCount = 0
    let skippedCount = 0

    for (const user of usersWithPassword) {
      // Find existing credential account for this user
      const existingAccount = await prisma.account.findFirst({
        where: {
          userId: user.id,
          provider: { in: ['credential', 'credentials'] },
        },
      })

      if (existingAccount) {
        // Check if account needs updating
        const needsUpdate =
          !existingAccount.password ||
          existingAccount.provider === 'credentials' ||
          existingAccount.providerAccountId !== user.email

        if (needsUpdate) {
          await prisma.account.update({
            where: { id: existingAccount.id },
            data: {
              password: user.hashedPassword,
              provider: 'credential',
              providerAccountId: user.email,
            },
          })
          updatedCount++
        } else {
          skippedCount++
        }
        continue
      }

      // Create new credential account
      await prisma.account.create({
        data: {
          userId: user.id,
          provider: 'credential',
          providerAccountId: user.email,
          password: user.hashedPassword,
        },
      })
      createdCount++
    }

    // Step 3: Normalize any remaining 'credentials' to 'credential'
    const normalizeResult = await prisma.account.updateMany({
      where: { provider: 'credentials' },
      data: { provider: 'credential' },
    })

    console.log(`\nMigration complete!`)
    console.log(`- Created new credential accounts: ${createdCount}`)
    console.log(`- Updated existing accounts: ${updatedCount}`)
    console.log(`- Skipped (already correct): ${skippedCount}`)
    console.log(`- Normalized provider name: ${normalizeResult.count}`)
  } catch (error) {
    console.error('Error during migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateCredentialAccounts().catch((error: Error) => {
  console.error('Script failed:', error)
  process.exit(1)
})
