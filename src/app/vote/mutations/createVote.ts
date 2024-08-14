import db from 'db'
import { resolver } from '@blitzjs/rpc'
import { z } from 'zod'

const CreateVote = z.object({
  winnerId: z.number(),
  votableAId: z.number(),
  votableBId: z.number(),
})

const createVote = resolver.pipe(
  resolver.zod(CreateVote),
  async ({ winnerId, votableAId, votableBId }, ctx) => {
    const voterId = ctx.session.userId

    if (!voterId) {
      throw new Error('You must be logged in to vote.')
    }

    await db.vote.create({
      data: {
        winnerId,
        votableAId,
        votableBId,
        voterId,
      },
    })

    // Optionally, update prestige scores or other related fields here.

    return true
  }
)

export default createVote
