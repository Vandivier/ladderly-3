import db from 'db'
import { resolver } from '@blitzjs/rpc'
import { Prisma } from '@prisma/client'

const getRandomVotablePair = resolver.pipe(async ({ type }) => {
  const randomPair = await db.$queryRaw<Prisma.VotableGetPayload<{}>[]>`
    SELECT *
    FROM "Votable"
    WHERE "type" = ${type}::"VotableType"
    ORDER BY RANDOM()
    LIMIT 2
  `

  return randomPair
})

export default getRandomVotablePair
