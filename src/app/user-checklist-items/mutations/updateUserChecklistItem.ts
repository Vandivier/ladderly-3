import { resolver } from '@blitzjs/rpc'
import db from 'db'
import { UpdateUserChecklistItemSchema } from '../schemas'

export default resolver.pipe(
  resolver.zod(UpdateUserChecklistItemSchema),
  resolver.authorize(),
  async ({ id, ...data }) => {
    const userChecklistItem = await db.userChecklistItem.update({
      where: { id },
      data,
    })

    if (data.isComplete) {
      // Check to see whether the whole UserChecklist is now complete
      const userChecklist = await db.userChecklist.findUnique({
        where: { id: userChecklistItem.userChecklistId },
        include: { userChecklistItems: true },
      })

      if (!userChecklist) {
        throw new Error('UserChecklist not found.')
      }

      const allItemsComplete = userChecklist.userChecklistItems.every(
        (item) => item.isComplete
      )
      if (allItemsComplete) {
        await db.userChecklist.update({
          where: { id: userChecklist.id },
          data: { isComplete: true },
        })
      }
    } else {
      await db.userChecklist.update({
        where: { id: userChecklistItem.userChecklistId },
        data: { isComplete: false },
      })
    }

    return userChecklistItem
  }
)
