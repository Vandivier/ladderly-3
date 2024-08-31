// src/app/questions/mutations/createAnswer.ts

import { resolver } from '@blitzjs/rpc'
import db from 'db'
import { z } from 'zod'

const CreateAnswer = z.object({
  body: z.string().min(30),
  questionId: z.number(),
})

export default resolver.pipe(
  resolver.zod(CreateAnswer),
  resolver.authorize(),
  async (input, ctx) => {
    const answer = await db.votable.create({
      data: {
        body: input.body,
        type: 'ANSWER',
        name: `Answer to question ${input.questionId}`,
        author: { connect: { id: ctx.session.userId } },
        parentVotable: { connect: { id: input.questionId } },
      },
    })

    return answer
  }
)
