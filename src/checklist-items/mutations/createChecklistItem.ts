import { resolver } from "@blitzjs/rpc"
import db from "db"
import { CreateChecklistItemSchema } from "../schemas"

export default resolver.pipe(
  resolver.zod(CreateChecklistItemSchema),
  resolver.authorize(["admin"]),
  async (input) => {
    const checklistItem = await db.checklistItem.create({ data: input })

    return checklistItem
  }
)
