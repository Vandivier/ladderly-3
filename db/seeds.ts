import db from "./index"
import fs from "fs"
import path from "path"

const prisma = db

const seed = async () => {
  const updateLatest = process.argv.includes("--update-latest-checklist")
  const version = new Date().toISOString()
  const files = ["./checklists.json", "./premium-checklists.json"]

  for (const file of files) {
    const filePath = path.resolve(__dirname, file)

    if (!fs.existsSync(filePath)) {
      console.warn("File ${filePath} does not exist." + "\nContinuing to seed...")
      continue
    }

    const rawData = fs.readFileSync(filePath)
    const checklists = JSON.parse(rawData.toString())

    for (const checklistData of checklists) {
      const { name, items } = checklistData
      let checklist

      if (updateLatest) {
        checklist = await prisma.checklist.findFirst({
          where: { name },
          orderBy: { createdAt: "desc" },
        })

        if (checklist) {
          checklist = await prisma.checklist.update({
            where: { id: checklist.id },
            data: { version },
          })
        }
      }

      if (!checklist) {
        checklist = await prisma.checklist.create({
          data: { name, version },
        })
      }

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const checklistItem = await prisma.checklistItem.findFirst({
          where: {
            AND: [{ checklistId: checklist.id }, { displayText: item }],
          },
        })

        if (checklistItem == null) {
          console.warn(`Checklist item not found for checklist: ${name} item idx: ${i}`)
        }

        if (checklistItem) {
          await prisma.checklistItem.update({
            where: { id: checklistItem.id },
            data: { displayIndex: i },
          })
        } else {
          await prisma.checklistItem.create({
            data: {
              displayText: item,
              displayIndex: i,
              checklistId: checklist.id,
            },
          })
        }
      }
    }
  }
}

export default seed
