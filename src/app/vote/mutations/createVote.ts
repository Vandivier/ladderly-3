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

    // Record the vote with or without a logged-in user
    await db.vote.create({
      data: {
        winnerId,
        votableAId,
        votableBId,
        voterId: voterId,
      },
    })

    // Update Votable with vote counts
    if (voterId) {
      await db.votable.update({
        where: { id: winnerId },
        data: {
          registeredUserVotes: { increment: 1 },
          prestigeScore: { increment: 1 },
        },
      })
    } else {
      await db.votable.update({
        where: { id: winnerId },
        data: {
          guestVotes: { increment: 1 },
          prestigeScore: { increment: 1 },
        },
      })
    }

    return true
  }
)

export default createVote
