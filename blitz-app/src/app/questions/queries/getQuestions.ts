// src/app/questions/queries/getQuestions.ts

import { resolver } from '@blitzjs/rpc'
import { paginate } from 'blitz'
import db, { Prisma } from 'db'
import { AUTHOR_FIELDS } from '../utils'

interface GetQuestionsInput {
  orderBy?: { [key: string]: 'asc' | 'desc' }
  skip?: number
  take?: number
  where?: {}
}

interface QuestionWithAuthor {
  id: number
  createdAt: Date
  name: string
  body: string | null
  tags: string[]
  author: {
    id: number
    name: string
    nameFirst: string
    nameLast: string
  }
  voteCount: number
  childVotables: { id: number }[]
  _count: { votes: number }
}

export default resolver.pipe(
  async ({ where, orderBy, skip = 0, take = 100 }: GetQuestionsInput) => {
    const whereCondition: Prisma.VotableWhereInput = {
      ...where,
      type: 'QUESTION',
      author: {
        isNot: null,
      },
    }

    const {
      items: questions,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.votable.count({ where: whereCondition }),
      query: (paginateArgs) =>
        db.votable.findMany({
          ...paginateArgs,
          where: whereCondition,
          orderBy,
          select: {
            id: true,
            name: true,
            createdAt: true,
            body: true,
            tags: true,
            author: {
              select: AUTHOR_FIELDS,
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
        }) as Promise<QuestionWithAuthor[]>,
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
