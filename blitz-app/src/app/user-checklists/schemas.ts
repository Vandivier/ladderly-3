import { ChecklistItem, UserChecklist, UserChecklistItem } from 'db'
import { ChecklistWithItems } from 'src/app/checklists/schemas'

export type UserChecklistItemWithChecklistItem = UserChecklistItem & {
  checklistItem: ChecklistItem
}

export type UserChecklistWithItems = UserChecklist & {
  userChecklistItems: UserChecklistItemWithChecklistItem[]
}

export type UserChecklistCascade = {
  checklist: ChecklistWithItems
  userChecklist: UserChecklistWithItems
}

export type UserChecklistByNameData = {
  latestChecklistId: number
  userChecklistCascade: UserChecklistCascade
}
