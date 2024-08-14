import db from 'db'
import { resolver } from '@blitzjs/rpc'
import { z } from 'zod'

const GetVotableLeaders = z.object({
  type: z.enum(['COMPANY', 'SCHOOL', 'SKILL']),
})

const getVotableLeaders = resolver.pipe(
  resolver.zod(GetVotableLeaders),
  async ({ type }) => {
    const leaders = await db.votable.findMany({
      where: { type },
      orderBy: { prestigeScore: 'desc' },
      take: 10,
    })
    return leaders
  }
)

export default getVotableLeaders
