import { resolver } from "@blitzjs/rpc"
import db from "db"

// TODO: if user allows it, even not-logged-in viewers can see some of their info
//    eg, in the case of public profiles
export default resolver.pipe(resolver.authorize(), async ({ id }: { id: number }) => {
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
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          checklistId: true,
          isComplete: true,
        },
      },
    },
  })

  if (!user) throw new Error("User not found")

  return user
})
