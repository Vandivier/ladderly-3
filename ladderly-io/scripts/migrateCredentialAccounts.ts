// run like `node --experimental-strip-types scripts/migrateCredentialAccounts.ts`
// This script creates Account entries for users with hashedPassword (credential login)
// Better-auth expects passwords in the Account table with provider="credential"

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
    // Find all users with a hashedPassword (credential users)
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
      `Found ${usersWithPassword.length} users with credential passwords to migrate`,
    )

    let migratedCount = 0
    let skippedCount = 0

    for (const user of usersWithPassword) {
      // Check if credential account already exists (handle both singular and plural)
      const existingAccount = await prisma.account.findFirst({
        where: {
          userId: user.id,
          provider: { in: ['credential', 'credentials'] },
        },
      })

      if (existingAccount) {
        // Update existing credential account: set password and normalize provider to 'credential'
        if (
          !existingAccount.password ||
          existingAccount.provider === 'credentials'
        ) {
          await prisma.account.update({
            where: { id: existingAccount.id },
            data: {
              password: user.hashedPassword,
              provider: 'credential', // Normalize to better-auth's expected value
            },
          })
          migratedCount++
          console.log(`Updated account for user ${user.email}`)
        } else {
          skippedCount++
        }
        continue
      }

      // Create credential account with the password
      await prisma.account.create({
        data: {
          userId: user.id,
          provider: 'credential',
          providerAccountId: user.email,
          password: user.hashedPassword,
        },
      })

      migratedCount++

      if (migratedCount % 100 === 0) {
        console.log(`Migrated ${migratedCount} users...`)
      }
    }

    // Also normalize any remaining accounts with 'credentials' (plural) to 'credential'
    const normalizeResult = await prisma.account.updateMany({
      where: { provider: 'credentials' },
      data: { provider: 'credential' },
    })

    console.log(`Migration complete!`)
    console.log(`- Created/updated credential accounts: ${migratedCount}`)
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
