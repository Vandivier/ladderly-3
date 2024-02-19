import { resolver } from "@blitzjs/rpc"
import db from "db"
import { UpdateChecklistItemSchema } from "../schemas"

export default resolver.pipe(
  resolver.zod(UpdateChecklistItemSchema),
  resolver.authorize(["ADMIN"]),
  async ({ id, ...data }) => {
    const checklistItem = await db.checklistItem.update({
      where: { id },
      data,
    })

    return checklistItem
  }
)
