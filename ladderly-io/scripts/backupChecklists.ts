// run like `node --experimental-strip-types scripts/backupChecklists.ts`
// or `tsx scripts/backupChecklists.ts`
// add `--overwrite` flag to overwrite files with fresh data from database only (default: append/merge mode)

import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  PrismaClient,
  type Checklist,
  type ChecklistItem,
} from '@prisma/client'
import dotenv from 'dotenv'

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure dotenv
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

type ChecklistWithItems = Checklist & {
  checklistItems: ChecklistItem[]
}

interface ChecklistData {
  name: string
  version: string
  items: Array<
    | string
    | {
        detailText: string
        displayText: string
        isRequired: boolean
        linkText: string
        linkUri: string
      }
  >
}

async function backup(): Promise<void> {
  try {
    const overwrite = process.argv.includes('--overwrite')

    if (overwrite) {
      console.log('Running in overwrite mode (fresh from database only)...\n')
    } else {
      console.log('Running in append/merge mode (default)...\n')
    }

    const checklistNames = await prisma.checklist.groupBy({
      by: ['name'],
    })

    const checklists: ChecklistWithItems[] = []

    for (const { name } of checklistNames) {
      const checklist = await prisma.checklist.findFirst({
        where: { name },
        orderBy: { createdAt: 'desc' },
        include: {
          checklistItems: {
            orderBy: {
              displayIndex: 'asc',
            },
          },
        },
      })
      if (checklist) {
        checklists.push(checklist)
      }
    }

    const premiumChecklistsPath = path.resolve(
      __dirname,
      '../prisma/seeds/premium-checklists.json',
    )

    // Initialize arrays - either fresh or from existing files
    let existingChecklists: ChecklistData[] = []
    let premiumChecklists: ChecklistData[] = []

    if (!overwrite) {
      // Read existing files for merge/append mode
      try {
        const existingChecklistsRaw = await fs.readFile(
          path.resolve(__dirname, '../prisma/seeds/checklists.json'),
        )
        existingChecklists = JSON.parse(existingChecklistsRaw.toString())
      } catch (error) {
        console.log('No existing checklists.json found, starting fresh.')
      }

      if (fs.existsSync(premiumChecklistsPath)) {
        try {
          const premiumChecklistsRaw = await fs.readFile(premiumChecklistsPath)
          premiumChecklists = JSON.parse(premiumChecklistsRaw.toString())
        } catch (error) {
          console.log('Could not read premium-checklists.json, starting fresh.')
        }
      }
    }

    // Process checklists from database
    for (const checklist of checklists) {
      const { name, version, checklistItems, isPremium } = checklist
      const items = checklistItems.map((item) => {
        if (
          item.linkText === '' &&
          item.linkUri === '' &&
          item.isRequired === true &&
          item.detailText === ''
        ) {
          return item.displayText
        } else {
          return {
            detailText: item.detailText,
            displayText: item.displayText,
            isRequired: item.isRequired,
            linkText: item.linkText,
            linkUri: item.linkUri,
          }
        }
      })

      const checklistData: ChecklistData = { name, version, items }

      if (isPremium) {
        // Update existing or add new premium checklist
        const existingIndex = premiumChecklists.findIndex(
          (c) => c.name === name,
        )
        if (existingIndex >= 0) {
          premiumChecklists[existingIndex] = checklistData
        } else {
          premiumChecklists.push(checklistData)
        }
      } else {
        // Update existing or add new non-premium checklist
        const existingIndex = existingChecklists.findIndex(
          (c) => c.name === name,
        )
        if (existingIndex >= 0) {
          existingChecklists[existingIndex] = checklistData
        } else {
          existingChecklists.push(checklistData)
        }
      }
    }

    await fs.writeFile(
      path.resolve(__dirname, '../prisma/seeds/checklists.json'),
      JSON.stringify(existingChecklists, null, 2),
    )
    await fs.writeFile(
      premiumChecklistsPath,
      JSON.stringify(premiumChecklists, null, 2),
    )

    console.log('Checklist backup completed!')
  } catch (error) {
    console.error('Error during backup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

backup().catch((error: Error) => {
  console.error('Script failed:', error)
  process.exit(1)
})
