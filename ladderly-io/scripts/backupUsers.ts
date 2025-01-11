// run like `node --experimental-strip-types scripts/backupUsers.ts`

import fs from 'fs-extra'
import path from 'path'
import { PrismaClient, type User } from '@prisma/client'
import dotenv from 'dotenv'

// Configure dotenv
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function backupUsers(): Promise<void> {
  try {
    const users: User[] = await prisma.user.findMany()
    const jsonUsers = JSON.stringify(users, null, 2)
    const date = new Date()
    const isoDate = date.toISOString().replace(/:/g, '-')
    const fileName = `./db/bak.users.${isoDate}.json`

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
