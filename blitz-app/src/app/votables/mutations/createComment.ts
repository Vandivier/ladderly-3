// src/app/votables/mutations/createComment.ts

import db from 'db'

export async function createComment(
  authorId: number,
  parentVotableId: number,
  body: string
) {
  const comment = await db.votable.create({
    data: {
      type: 'COMMENT',
      name: `Comment on ${parentVotableId}`,
      body,
      author: { connect: { id: authorId } },
      parentVotable: { connect: { id: parentVotableId } },
    },
  })

  return comment
}
