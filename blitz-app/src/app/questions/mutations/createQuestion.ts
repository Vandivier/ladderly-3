// src/app/questions/mutations/createQuestion.ts

import { resolver } from '@blitzjs/rpc'
import db from 'db'
import { z } from 'zod'

const CreateQuestion = z.object({
  name: z.string(),
  body: z.string(),
  tags: z.array(z.string()),
  type: z.literal('QUESTION'),
})

export default resolver.pipe(
  resolver.zod(CreateQuestion),
  resolver.authorize(),
  async (input, ctx) => {
    const question = await db.votable.create({
      data: {
        ...input,
        author: { connect: { id: ctx.session.userId } },
      },
    })

    return question
  }
)
