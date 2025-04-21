// run like `node --experimental-strip-types scripts/backupChecklists.ts`

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

    const existingChecklistsRaw = await fs.readFile(
      path.resolve(__dirname, '../prisma/seeds/checklists.json'),
    )
    let existingChecklists: ChecklistData[] = JSON.parse(
      existingChecklistsRaw.toString(),
    )
    const existingChecklistNames = existingChecklists.map(
      (checklist) => checklist.name,
    )

    const premiumChecklistsPath = path.resolve(
      __dirname,
      '../prisma/seeds/premium-checklists.json',
    )
    let premiumChecklists: ChecklistData[] = []

    if (fs.existsSync(premiumChecklistsPath)) {
      const premiumChecklistsRaw = await fs.readFile(premiumChecklistsPath)
      premiumChecklists = JSON.parse(premiumChecklistsRaw.toString())
    }

    for (const checklist of checklists) {
      const { name, version, checklistItems } = checklist
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

      if (existingChecklistNames.includes(name)) {
        existingChecklists = existingChecklists.map((checklist) =>
          checklist.name === name ? checklistData : checklist,
        )
      } else {
        premiumChecklists.push(checklistData)
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
