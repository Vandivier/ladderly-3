// src/app/questions/mutations/deleteAnswer.ts

import { resolver } from '@blitzjs/rpc'
import db from 'db'
import { z } from 'zod'

const DeleteAnswer = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteAnswer),
  resolver.authorize(),
  async ({ id }, ctx) => {
    const answer = await db.votable.findFirst({
      where: { id, type: 'ANSWER', authorId: ctx.session.userId },
    })

    if (!answer) {
      throw new Error("Answer not found or you're not authorized to delete it")
    }

    await db.votable.delete({ where: { id } })

    return answer
  }
)
