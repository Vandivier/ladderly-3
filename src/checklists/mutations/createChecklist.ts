import { resolver } from "@blitzjs/rpc"
import db from "db"
import { CreateChecklistSchema } from "../schemas"

export default resolver.pipe(
  resolver.zod(CreateChecklistSchema),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const checklist = await db.checklist.create({ data: input })

    return checklist
  }
)
