// run like `node --experimental-strip-types scripts/migrateAccountIdToInt.ts`
// This script migrates Account.id from String to Int while preserving all data
// Run BEFORE changing schema and running prisma db push

import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import fs from 'fs-extra'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function migrateAccountIds(): Promise<void> {
  try {
    // Step 1: Export all Account records
    const accounts = await prisma.account.findMany()
    console.log(`Found ${accounts.length} accounts to migrate`)

    // Backup to file
    const backupDir = path.resolve(__dirname, './backup-data')
    await fs.ensureDir(backupDir)
    const backupFile = path.join(
      backupDir,
      `accounts-backup-${Date.now()}.json`,
    )
    await fs.writeJSON(backupFile, accounts, { spaces: 2 })
    console.log(`Backed up accounts to ${backupFile}`)

    // Step 2: Drop and recreate Account table with Int ID using raw SQL
    console.log('\nRecreating Account table with Int ID...')

    // Drop temp table if it exists from a previous failed run
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Account_new" CASCADE`

    // Create temp table with Int ID
    await prisma.$executeRaw`
      CREATE TABLE "Account_new" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "accessToken" TEXT,
        "refreshToken" TEXT,
        "accessTokenExpiresAt" TIMESTAMP(3),
        "refreshTokenExpiresAt" TIMESTAMP(3),
        "idToken" TEXT,
        "scope" TEXT,
        "password" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Account_new_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `

    // Copy data (excluding old string ID, let serial generate new Int IDs)
    // Note: idToken may not exist in old table, so we use NULL
    await prisma.$executeRaw`
      INSERT INTO "Account_new" (
        "userId", "providerAccountId", "provider", "accessToken", "refreshToken",
        "accessTokenExpiresAt", "refreshTokenExpiresAt", "idToken", "scope", 
        "password", "createdAt", "updatedAt"
      )
      SELECT 
        "userId", "providerAccountId", "provider", "accessToken", "refreshToken",
        "accessTokenExpiresAt", "refreshTokenExpiresAt", NULL, "scope",
        "password", "createdAt", "updatedAt"
      FROM "Account"
    `

    // Create unique constraint
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX "Account_new_provider_providerAccountId_key" 
      ON "Account_new"("provider", "providerAccountId")
    `

    // Drop old table and rename new one
    await prisma.$executeRaw`DROP TABLE "Account" CASCADE`
    await prisma.$executeRaw`ALTER TABLE "Account_new" RENAME TO "Account"`
    await prisma.$executeRaw`
      ALTER INDEX "Account_new_provider_providerAccountId_key" 
      RENAME TO "Account_provider_providerAccountId_key"
    `

    // Verify
    const newAccounts =
      await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Account"`
    console.log(`\nMigration complete! Accounts in new table:`, newAccounts)
  } catch (error) {
    console.error('Error during migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateAccountIds().catch((error: Error) => {
  console.error('Script failed:', error)
  process.exit(1)
})
