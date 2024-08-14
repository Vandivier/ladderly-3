import db from 'db'
import { resolver } from '@blitzjs/rpc'

const getRandomVotablePair = resolver.pipe(async () => {
  const votables = await db.votable.findMany({
    orderBy: {
      id: 'asc',
    },
    take: 2,
  })

  return votables
})

export default getRandomVotablePair
