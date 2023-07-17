const fs = require("fs-extra")
const path = require("path")

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") })

const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const backup = async () => {
  const checklists = await prisma.checklist.findMany({
    include: { checklistItems: true },
    orderBy: { createdAt: "desc" },
  })

  const existingChecklistsRaw = fs.readFileSync(path.resolve(__dirname, "../db/checklists.json"))
  const existingChecklists = JSON.parse(existingChecklistsRaw.toString())
  const existingChecklistNames = existingChecklists.map((checklist) => checklist.name)
  const newChecklists = []
  const premiumChecklists = []

  for (const checklist of checklists) {
    const { name, version, checklistItems } = checklist
    const items = checklistItems.map((item) => item.displayText)

    const checklistData = { name, version, items }

    if (existingChecklistNames.includes(name)) {
      newChecklists.push(checklistData)
    } else {
      premiumChecklists.push(checklistData)
    }
  }

  fs.writeFileSync(
    path.resolve(__dirname, "../db/checklists.json"),
    JSON.stringify(newChecklists, null, 2)
  )
  fs.writeFileSync(
    path.resolve(__dirname, "../db/premium-checklists.json"),
    JSON.stringify(premiumChecklists, null, 2)
  )

  console.log("Checklist backup completed!")
}

backup()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
