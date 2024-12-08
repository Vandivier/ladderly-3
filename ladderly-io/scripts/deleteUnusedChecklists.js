const fs = require('fs-extra')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const cleanup = async () => {
  const checklists = await prisma.checklist.findMany()

  for (const checklist of checklists) {
    const userChecklist = await prisma.userChecklist.findFirst({
      where: { checklistId: checklist.id },
    })

    if (!userChecklist) {
      await prisma.checklistItem.deleteMany({
        where: { checklistId: checklist.id },
      })

      await prisma.checklist.delete({
        where: { id: checklist.id },
      })

      console.log(`Deleted checklist ${checklist.id}`)
    }
  }

  console.log('Checklist cleanup completed!')
}

cleanup()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
