import fs from "fs"
import path from "path"
import db, { Checklist } from "./index"
import {
  ChecklistSeedDataType,
  ChecklistsSchema,
  updateChecklistsInPlace,
} from "./seed-utils/updateChecklists"

const createNewChecklist = async (
  checklistData: ChecklistSeedDataType
): Promise<void> => {
  const { name, items } = checklistData as ChecklistSeedDataType
  const version = "ignoreme_version_field_deprecation_in_progress"
  const checklist: Checklist | null = await db.checklist.create({
    data: { name, version },
  })

  for (let i = 0; i < items.length; i++) {
    const itemData = items[i]
    let displayText, linkText, linkUri, isRequired, detailText

    if (typeof itemData === "undefined") {
      throw new Error(
        `Checklist item is undefined for checklist: ${name} item idx: ${i}`
      )
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
      isRequired =
        itemData.isRequired === undefined ? true : itemData.isRequired
      detailText = itemData.detailText || ""
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
  const updateLatestInPlace = process.argv.includes(
    "--update-latest-checklists"
  )
  const files = ["./checklists.json", "./premium-checklists.json"]

  for (const file of files) {
    const filePath = path.resolve(__dirname, file)

    if (!fs.existsSync(filePath)) {
      console.warn(
        `File ${filePath} does not exist." + "\nContinuing to seed...`
      )
      continue
    }

    const rawData = fs.readFileSync(filePath)
    const unverifiedChecklistJson = JSON.parse(rawData.toString())
    const checklists = ChecklistsSchema.parse(unverifiedChecklistJson)

    for (const checklistData of checklists) {
      if (updateLatestInPlace) {
        await updateChecklistsInPlace(checklistData)
      } else {
        await createNewChecklist(checklistData)
      }
    }
  }
}

export default seed
