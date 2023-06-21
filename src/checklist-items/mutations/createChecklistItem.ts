import { resolver } from "@blitzjs/rpc"
import db from "db"
import { CreateChecklistItemSchema } from "../schemas"

export default resolver.pipe(
  resolver.zod(CreateChecklistItemSchema),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const checklistItem = await db.checklistItem.create({ data: input })

    return checklistItem
  }
)
