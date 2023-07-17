const fs = require("fs-extra")
const path = require("path")

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") })

const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const backup = async () => {
  const checklistNames = await prisma.checklist.groupBy({
    by: ["name"],
  })

  let checklists = []

  for (const { name } of checklistNames) {
    const checklist = await prisma.checklist.findFirst({
      where: { name },
      orderBy: { createdAt: "desc" },
      include: { checklistItems: true },
    })
    checklists.push(checklist)
  }

  const existingChecklistsRaw = fs.readFileSync(path.resolve(__dirname, "../db/checklists.json"))
  const existingChecklists = JSON.parse(existingChecklistsRaw.toString())
  const existingChecklistNames = existingChecklists.map((checklist) => checklist.name)
  const newChecklists = []

  const premiumChecklistsPath = path.resolve(__dirname, "../db/premium-checklists.json")
  let premiumChecklists = []

  if (fs.existsSync(premiumChecklistsPath)) {
    const premiumChecklistsRaw = fs.readFileSync(premiumChecklistsPath)
    premiumChecklists = JSON.parse(premiumChecklistsRaw.toString())
  }

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
  fs.writeFileSync(premiumChecklistsPath, JSON.stringify(premiumChecklists, null, 2))

  console.log("Checklist backup completed!")
}

backup()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
