// src/app/questions/queries/getQuestions.ts

import { paginate } from 'blitz'
import { resolver } from '@blitzjs/rpc'
import db from 'db'

interface GetQuestionsInput {
  orderBy?: { [key: string]: 'asc' | 'desc' }
  skip?: number
  take?: number
  where?: {}
}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetQuestionsInput) => {
    const {
      items: questions,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.votable.count({ where: { ...where, type: 'QUESTION' } }),
      query: (paginateArgs) =>
        db.votable.findMany({
          ...paginateArgs,
          where: { ...where, type: 'QUESTION' },
          orderBy,
          select: {
            id: true,
            name: true,
            createdAt: true,
            body: true,
            tags: true,
            author: {
              select: {
                id: true,
                name: true,
              },
            },
            voteCount: true,
            childVotables: {
              where: { type: 'ANSWER' },
              select: { id: true },
            },
            _count: {
              select: { votes: true },
            },
          },
        }),
    })

    const questionsWithCounts = questions.map((question) => ({
      ...question,
      answerCount: question.childVotables.length,
      voteCount: question._count.votes,
    }))

    return {
      questions: questionsWithCounts,
      nextPage,
      hasMore,
      count,
    }
  }
)
