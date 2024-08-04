import { resolver } from '@blitzjs/rpc'
import db, { Checklist } from 'db'

export default resolver.pipe(
  resolver.authorize(),
  async ({ name }: { name: string }): Promise<Checklist | null> => {
    const newestChecklist = await db.checklist.findFirst({
      where: {
        name,
      },
      orderBy: {
        version: 'desc',
      },
    })

    return newestChecklist
  }
)
