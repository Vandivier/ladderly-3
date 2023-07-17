import db from "./index"
import fs from "fs"
import path from "path"

const prisma = db

const seed = async () => {
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

      // the AND clause identifies a checklist uniquely
      let checklist = await prisma.checklist.findFirst({
        where: {
          AND: [{ name }, { version }],
        },
      })

      if (checklist) {
        checklist = await prisma.checklist.update({
          where: { id: checklist.id },
          data: { version },
        })
      } else {
        checklist = await prisma.checklist.create({
          data: { name, version },
        })
      }

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        console.log({ item })
        const checklistItem = await prisma.checklistItem.findFirst({
          where: {
            AND: [{ checklistId: checklist.id }, { displayText: item }],
          },
        })

        // TODO: fix this is nulling out
        console.log({ checklistItem: checklistItem })

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
