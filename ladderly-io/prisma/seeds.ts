import { Checklist } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { db } from '../src/server/db'

import { seedLeetcodeChecklist } from './seed-utils/seedLeetcodeChecklist'
import { seedVotables } from './seed-utils/seedVotables'
import { seedPractices } from './seed-utils/seedPractices'
import {
  ChecklistSeedDataType,
  ChecklistsSchema,
  updateChecklistsInPlace,
} from './seed-utils/updateChecklists'

// Use __dirname directly since this is CommonJS
const __dirname = process.cwd() + '/prisma'

const createNewChecklist = async (
  checklistData: ChecklistSeedDataType,
): Promise<void> => {
  const { name, items } = checklistData as ChecklistSeedDataType
  const version = 'ignoreme_version_field_deprecation_in_progress'
  const checklist: Checklist | null = await db.checklist.create({
    data: { name, version },
  })

  for (let i = 0; i < items.length; i++) {
    const itemData = items[i]
    let displayText, linkText, linkUri, isRequired, detailText

    if (typeof itemData === 'undefined') {
      throw new Error(
        `Checklist item is undefined for checklist: ${name} item idx: ${i}`,
      )
    } else if (typeof itemData === 'string') {
      displayText = itemData
      linkText = ''
      linkUri = ''
      isRequired = true
      detailText = ''
    } else {
      displayText = itemData.displayText
      linkText = itemData.linkText || ''
      linkUri = itemData.linkUri || ''
      isRequired =
        itemData.isRequired === undefined ? true : itemData.isRequired
      detailText = itemData.detailText || ''
    }

    await db.checklistItem.create({
      data: {
        displayText,
        displayIndex: i,
        checklistId: checklist.id,
        linkText,
        linkUri,
        isRequired,
        detailText,
        version,
      },
    })
  }
}

const seed = async () => {
  // Seed votables
  console.log('Starting seedVotables...')
  await seedVotables()

  console.log('Starting seedLeetcodeChecklist...')
  await seedLeetcodeChecklist()

  console.log('Starting seedPractices...')
  await seedPractices(db)

  const checklistNameToUpdate =
    process.argv.find((arg) => arg.startsWith('--name='))?.split('=')[1] || ''
  const files = ['./checklists.json', './premium-checklists.json']
  const updateLatestInPlace = process.argv.includes(
    '--update-latest-checklists',
  )

  for (const file of files) {
    const filePath = path.resolve(__dirname, './seeds', file)

    if (!fs.existsSync(filePath)) {
      console.warn(
        `File ${filePath} does not exist." + "\nContinuing to seed...`,
      )
      continue
    }

    const rawData = fs.readFileSync(filePath)
    const unverifiedChecklistJson = JSON.parse(rawData.toString())
    const checklists = ChecklistsSchema.parse(unverifiedChecklistJson)

    for (const checklistData of checklists) {
      if (
        checklistNameToUpdate &&
        checklistData.name !== checklistNameToUpdate
      ) {
        continue
      }

      if (updateLatestInPlace) {
        await updateChecklistsInPlace(checklistData)
      } else {
        await createNewChecklist(checklistData)
      }
    }
  }
}

seed()
