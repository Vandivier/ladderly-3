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
            description: true,
            author: {
              select: {
                id: true,
                name: true,
              },
            },
            voteCount: true,
            tags: true,
            _count: {
              select: { childVotables: true },
            },
          },
        }),
    })

    const questionsWithAnswerCount = questions.map((question) => ({
      ...question,
      answerCount: question._count.childVotables,
    }))

    return {
      questions: questionsWithAnswerCount,
      nextPage,
      hasMore,
      count,
    }
  }
)
