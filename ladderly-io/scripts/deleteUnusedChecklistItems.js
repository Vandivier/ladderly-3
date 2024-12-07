const fs = require('fs-extra')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const cleanup = async () => {
  const checklistItems = await prisma.checklistItem.findMany()

  for (const checklistItem of checklistItems) {
    const checklist = await prisma.checklist.findFirst({
      where: { id: checklistItem.checklistId },
    })

    if (!checklist || checklist.version !== checklistItem.version) {
      await prisma.checklistItem.delete({
        where: { id: checklistItem.id },
      })

      console.log(`Deleted checklist item ${checklistItem.id}`)
    }
  }

  console.log('Checklist item cleanup completed!')
}

cleanup()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
