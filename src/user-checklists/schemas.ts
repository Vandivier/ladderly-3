import { ChecklistItem, UserChecklist, UserChecklistItem } from "db"
import { ChecklistWithItems } from "src/checklists/schemas"

export type UserChecklistItemWithChecklistItem = UserChecklistItem & {
  checklistItem: ChecklistItem
}

export type UserChecklistWithChecklistItems = UserChecklist & {
  userChecklistItems: (UserChecklistItem & {
    checklistItem: ChecklistItem
  })[]
}

export type UserChecklistByNameData = {
  checklist: ChecklistWithItems
  isLatestVersion: boolean
  latestChecklist: ChecklistWithItems
  userChecklistWithChecklistItems: UserChecklistWithChecklistItems
}
