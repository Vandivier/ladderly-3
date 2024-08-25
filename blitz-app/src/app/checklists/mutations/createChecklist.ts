import { resolver } from '@blitzjs/rpc'
import db from 'db'
import { CreateChecklistSchema } from '../schemas'

export default resolver.pipe(
  resolver.zod(CreateChecklistSchema),
  resolver.authorize(['ADMIN']),
  async (input) => {
    const checklist = await db.checklist.create({ data: input })

    return checklist
  }
)
