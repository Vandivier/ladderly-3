import path from 'path'

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })

import db from '../db'

async function deleteChecklist(checklistId: number) {
  const checklist = await db.checklist.findUnique({
    where: { id: checklistId },
  })

  if (!checklist) {
    throw new Error(`Checklist with ID ${checklistId} not found.`)
  }

  // Cascade delete userChecklistItems related to this checklist
  await db.userChecklistItem.deleteMany({
    where: {
      userChecklist: {
        checklistId: checklistId,
      },
    },
  })

  // Cascade delete userChecklists related to this checklist
  await db.userChecklist.deleteMany({
    where: { checklistId },
  })

  // Cascade delete checklistItems related to this checklist
  await db.checklistItem.deleteMany({
    where: { checklistId },
  })

  // Finally, delete the checklist itself
  await db.checklist.delete({
    where: { id: checklistId },
  })

  console.log(
    `Checklist with ID ${checklistId} and all related entities have been deleted.`
  )
}

// Main script execution
const main = async () => {
  const checklistIdAsStr =
    process.argv
      .find((arg) => arg.startsWith('--checklistId='))
      ?.split('=')[1] || ''
  const checklistId = parseInt(checklistIdAsStr, 10)

  if (!checklistId) {
    console.log(
      'Did not receive a valid checklistId. \n' +
        'Received: ' +
        checklistIdAsStr +
        '\n' +
        'From the scripts/ dir, call this script like:\n' +
        '`npx ts-node -P tsconfig.script.json scripts/cascadeDeleteChecklist.ts --checklistId=123`\n' +
        'Exiting.'
    )
    process.exit(1)
  }

  try {
    await deleteChecklist(checklistId)
    process.exit(0)
  } catch (error) {
    console.error('An error occurred:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await db.$disconnect()
  })
