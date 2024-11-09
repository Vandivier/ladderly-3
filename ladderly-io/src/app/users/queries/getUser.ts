// TODO: migrate to trpc

import { Ctx } from '@blitzjs/next'
import { resolver } from '@blitzjs/rpc'
import { AuthorizationError, NotFoundError } from 'blitz'
import db from 'db'

export default resolver.pipe(async ({ id }: { id: number }, ctx: Ctx) => {
  if (id !== parseInt(id.toString())) throw new NotFoundError()

  const isOwnData = ctx.session.userId === id
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      uuid: true,
      nameFirst: true,
      nameLast: true,
      hasPublicProfileEnabled: true,
      hasShoutOutsEnabled: true,
      hasOpenToWork: true,
      profileBlurb: true,
      profileContactEmail: true,
      profileGitHubUri: true,
      profileHomepageUri: true,
      profileLinkedInUri: true,
      userChecklists: {
        where: { isComplete: true },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          checklist: true,
          createdAt: true,
          isComplete: true,
          updatedAt: true,
        },
      },
    },
  })

  if (!user) throw new NotFoundError('User not found')
  if (isOwnData || user.hasPublicProfileEnabled) {
    return user
  }

  throw new AuthorizationError(
    'You do not have permission to view this user data.'
  )
})
