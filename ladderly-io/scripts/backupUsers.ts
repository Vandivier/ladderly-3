// run like `node --experimental-strip-types scripts/backupUsers.ts`

import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient, type User } from '@prisma/client'
import dotenv from 'dotenv'

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure dotenv
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function backupUsers(): Promise<void> {
  try {
    const users: User[] = await prisma.user.findMany()
    const jsonUsers = JSON.stringify(users, null, 2)
    const date = new Date()
    const isoDate = date.toISOString().replace(/:/g, '-')

    // Create backup directory if it doesn't exist
    const backupDir = path.resolve(__dirname, './backup-data')
    await fs.ensureDir(backupDir)

    const fileName = path.join(backupDir, `bak.users.${isoDate}.json`)
    await fs.writeFile(fileName, jsonUsers)
    console.log(`Backup of ${users.length} users completed!`)
  } catch (error) {
    console.error('Error during backup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

backupUsers().catch((error: Error) => {
  console.error('Script failed:', error)
  process.exit(1)
})
