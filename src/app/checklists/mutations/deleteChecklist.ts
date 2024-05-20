import { resolver } from "@blitzjs/rpc"
import db from "db"
import { DeleteChecklistSchema } from "../schemas"

export default resolver.pipe(
  resolver.zod(DeleteChecklistSchema),
  resolver.authorize(["ADMIN"]),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const checklist = await db.checklist.deleteMany({ where: { id } })

    return checklist
  }
)
