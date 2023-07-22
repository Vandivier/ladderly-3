import { resolver } from "@blitzjs/rpc"
import db from "db"
import { UpdateUserChecklistItemSchema } from "../schemas"

export default resolver.pipe(
  resolver.zod(UpdateUserChecklistItemSchema),
  resolver.authorize(),
  async ({ id, ...data }) => {
    const checklistItem = await db.userChecklistItem.update({
      where: { id },
      data,
    })

    return checklistItem
  }
)
