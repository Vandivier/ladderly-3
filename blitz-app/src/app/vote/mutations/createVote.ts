// src/app/vote/mutations/createVote.ts

import db from 'db'
import { resolver } from '@blitzjs/rpc'
import { z } from 'zod'

const CreateVote = z.object({
  votableId: z.number(),
  voteType: z.enum(['UPVOTE', 'DOWNVOTE']),
  loserId: z.number().optional(),
})

const createVote = resolver.pipe(
  resolver.zod(CreateVote),
  resolver.authorize(),
  async ({ votableId, voteType, loserId }, ctx) => {
    const voterId = ctx.session.userId

    // Begin a transaction
    return await db.$transaction(async (tx) => {
      // Create the vote
      const vote = await tx.vote.create({
        data: {
          votable: { connect: { id: votableId } },
          voter: { connect: { id: voterId } },
          voteType,
        },
      })

      // Update the votable
      const voteValue = voteType === 'UPVOTE' ? 1 : -1
      await tx.votable.update({
        where: { id: votableId },
        data: {
          voteCount: { increment: 1 },
          prestigeScore: { increment: voteValue },
        },
      })

      // If it's a head-to-head vote, update the loser
      if (loserId) {
        await tx.votable.update({
          where: { id: loserId },
          data: {
            voteCount: { increment: 1 },
            prestigeScore: { decrement: 1 },
          },
        })
      }

      return vote
    })
  }
)

export default createVote
