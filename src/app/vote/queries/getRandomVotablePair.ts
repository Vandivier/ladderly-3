import db from 'db'
import { resolver } from '@blitzjs/rpc'
import { Prisma } from '@prisma/client'

const getRandomVotablePair = resolver.pipe(async () => {
  const randomPair = await db.$queryRaw`
    SELECT *
    FROM "Votable"
    ORDER BY RANDOM()
    LIMIT 2
  `

  return randomPair as Prisma.VotableGetPayload<{}>[]
})

export default getRandomVotablePair
