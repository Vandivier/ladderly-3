import db, { VotableType } from 'db'
import { resolver } from '@blitzjs/rpc'
import { z } from 'zod'

const VotableTypeEnum = z.enum(
  Object.keys(VotableType) as [string, ...string[]]
)

const GetVotableLeaders = z.object({
  type: VotableTypeEnum,
})

const getVotableLeaders = resolver.pipe(
  resolver.zod(GetVotableLeaders),
  async ({ type }) => {
    const leaders = await db.votable.findMany({
      where: { type: type as VotableType },
      orderBy: [
        { prestigeScore: 'desc' },
        { registeredUserVotes: 'desc' },
        { name: 'asc' },
      ],
      take: 10,
    })
    return leaders
  }
)

export default getVotableLeaders
