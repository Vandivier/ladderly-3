import fs from "fs"
import path from "path"
import db, { Checklist } from "./index"
import {
  ChecklistSeedDataType,
  ChecklistsSchema,
  updateChecklistsInPlace,
} from "./seed-utils/updateChecklists"

const seed = async () => {
  const updateLatest = process.argv.includes("--update-latest-checklists")
  const version = new Date().toISOString()
  const files = ["./checklists.json", "./premium-checklists.json"]

  for (const file of files) {
    const filePath = path.resolve(__dirname, file)

    if (!fs.existsSync(filePath)) {
      console.warn("File ${filePath} does not exist." + "\nContinuing to seed...")
      continue
    }

    const rawData = fs.readFileSync(filePath)
    const unverifiedChecklistJson = JSON.parse(rawData.toString())
    const checklists = ChecklistsSchema.parse(unverifiedChecklistJson)

    for (const checklistData of checklists) {
      const { name, items } = checklistData as ChecklistSeedDataType
      let checklist: Checklist | null = null

      if (updateLatest) {
        checklist = await updateChecklistsInPlace(checklistData)
      }

      if (!checklist) {
        checklist = await db.checklist.create({
          data: { name, version },
        })
      }

      for (let i = 0; i < items.length; i++) {
        const itemData = items[i]
        let displayText, linkText, linkUri, isRequired, detailText

        if (typeof itemData === "undefined") {
          throw new Error(`Checklist item is undefined for checklist: ${name} item idx: ${i}`)
        } else if (typeof itemData === "string") {
          displayText = itemData
          linkText = ""
          linkUri = ""
          isRequired = true
          detailText = ""
        } else {
          displayText = itemData.displayText
          linkText = itemData.linkText || ""
          linkUri = itemData.linkUri || ""
          isRequired = itemData.isRequired === undefined ? true : itemData.isRequired
          detailText = itemData.detailText || ""
        }

        const checklistItem = await db.checklistItem.findFirst({
          where: {
            AND: [{ checklistId: checklist.id }, { displayText }],
          },
        })

        if (checklistItem == null) {
          console.warn(`WARN: Checklist item not found for checklist: ${name} item idx: ${i}`)
        }

        // TODO: don't do this if we are updating in place
        if (checklistItem) {
          await db.checklistItem.update({
            where: { id: checklistItem.id },
            data: { displayIndex: i, version: checklist.version },
          })
        } else {
          await db.checklistItem.create({
            data: {
              displayText,
              displayIndex: i,
              checklistId: checklist.id,
              linkText,
              linkUri,
              isRequired,
              detailText,
              version: checklist.version,
            },
          })
        }
      }
    }
  }
}

export default seed
