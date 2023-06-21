import { resolver } from "@blitzjs/rpc"
import db from "db"
import { UpdateChecklistItemSchema } from "../schemas"

export default resolver.pipe(
  resolver.zod(UpdateChecklistItemSchema),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const checklistItem = await db.checklistItem.update({
      where: { id },
      data,
    })

    return checklistItem
  }
)
