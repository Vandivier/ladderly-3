import { resolver } from "@blitzjs/rpc"
import db from "db"
import { DeleteChecklistItemSchema } from "../schemas"

export default resolver.pipe(
  resolver.zod(DeleteChecklistItemSchema),
  resolver.authorize(["ADMIN"]),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const checklistItem = await db.checklistItem.deleteMany({ where: { id } })

    return checklistItem
  }
)
