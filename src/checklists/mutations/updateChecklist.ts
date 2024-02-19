import { resolver } from "@blitzjs/rpc"
import db from "db"
import { UpdateChecklistSchema } from "../schemas"

export default resolver.pipe(
  resolver.zod(UpdateChecklistSchema),
  resolver.authorize(["admin"]),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const checklist = await db.checklist.update({ where: { id }, data })

    return checklist
  }
)
