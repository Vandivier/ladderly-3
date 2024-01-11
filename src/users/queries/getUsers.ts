import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetUsersInput
  extends Pick<Prisma.UserFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(async ({ where, orderBy, skip = 0, take = 100 }: GetUsersInput) => {
  const {
    items: users,
    hasMore,
    nextPage,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.user.count({ where }),
    query: (paginateArgs) =>
      db.user.findMany({
        ...paginateArgs,
        where: {
          ...where,
          hasPublicProfileEnabled: true,
        },
        orderBy,
        select: {
          id: true,
          uuid: true,
          createdAt: true,
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
          totalContributions: true,
        },
      }),
  })

  return {
    users,
    nextPage,
    hasMore,
    count,
  }
})
