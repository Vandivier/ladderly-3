// run like `node --experimental-strip-types scripts/backupUsers.ts`

import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient, type User, type Subscription } from '@prisma/client'
import dotenv from 'dotenv'

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure dotenv
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

type UserWithSubscriptions = User & {
  subscriptions: Subscription[]
}

async function backupUsers(): Promise<void> {
  try {
    const users = (await prisma.user.findMany({
      include: {
        subscriptions: true,
      },
    })) as UserWithSubscriptions[]

    const jsonUsers = JSON.stringify(users, null, 2)
    const date = new Date()
    const isoDate = date.toISOString().replace(/:/g, '-')

    // Create backup directory if it doesn't exist
    const backupDir = path.resolve(__dirname, './backup-data')
    await fs.ensureDir(backupDir)

    const fileName = path.join(backupDir, `bak.users.${isoDate}.json`)
    await fs.writeFile(fileName, jsonUsers)
    console.log(
      `Backup of ${users.length} users completed with subscription data!`,
    )

    // Log subscription statistics
    const usersWithSubscriptions = users.filter(
      (user) => user.subscriptions.length > 0,
    )
    console.log(`Users with subscriptions: ${usersWithSubscriptions.length}`)

    const subscriptionsByTier = users.reduce(
      (acc, user) => {
        user.subscriptions.forEach((sub) => {
          acc[sub.tier] = (acc[sub.tier] || 0) + 1
        })
        return acc
      },
      {} as Record<string, number>,
    )

    console.log('Subscriptions by tier:', subscriptionsByTier)
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
