// src/app/questions/queries/getQuestion.ts

import { resolver } from '@blitzjs/rpc'
import db from 'db'
import { NotFoundError } from 'blitz'

export const AUTHOR_FIELDS = { id: true, nameFirst: true, nameLast: true }

export default resolver.pipe(
  resolver.authorize(),
  async ({ id }: { id: number }) => {
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
      ...question,
      answers: question.childVotables,
      answerCount: question._count.childVotables,
      voteCount: question._count.votes,
    }
  }
)
