// src/app/questions/queries/getQuestion.ts

import { BlitzCtx } from '@blitzjs/auth'
import { resolver } from '@blitzjs/rpc'
import { NotFoundError } from 'blitz'
import db from 'db'
import getCurrentUser from 'src/app/users/queries/getCurrentUser'
import { AUTHOR_FIELDS } from '../utils'

export default resolver.pipe(async ({ id }: { id: number }, ctx: BlitzCtx) => {
  const currentUser = await getCurrentUser(null, ctx)
  if (!currentUser) {
    return { currentUser, question: null }
  }

  const question = await db.votable.findFirst({
    where: { id, type: 'QUESTION' },
    include: {
      author: {
        select: AUTHOR_FIELDS,
      },
      childVotables: {
        where: { type: 'ANSWER' },
        include: {
          author: {
            select: AUTHOR_FIELDS,
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          votes: true,
          childVotables: {
            where: { type: 'ANSWER' },
          },
        },
      },
    },
  })

  if (!question) throw new NotFoundError()

  return {
    currentUser,
    question: {
      ...question,
      answers: question.childVotables,
      answerCount: question._count.childVotables,
      voteCount: question._count.votes,
    },
  }
})
