import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { AuthenticationError } from "blitz"
import db, { Checklist } from "db"

export default resolver.pipe(
  resolver.authorize(),
  async ({ name }: { name: string }, ctx: Ctx): Promise<null | Checklist> => {
    const { userId } = ctx.session

    if (!userId) throw new AuthenticationError()

    // Find the UserChecklist for the given user and checklist name
    const userChecklist = await db.userChecklist.findFirst({
      where: {
        userId,
        checklist: {
          name,
        },
      },
      include: {
        checklist: true,
      },
    })

    if (!userChecklist) return null
    const currentVersionDate = new Date(userChecklist.checklist.version)
    const checklists = await db.checklist.findMany({
      where: {
        name,
      },
    })

    // Filter the checklists to find ones with a newer version
    const newerChecklists = checklists.filter((checklist) => {
      const checklistVersionDate = new Date(checklist.version)
      return checklistVersionDate > currentVersionDate
    })

    // Sort the newer checklists by their versions in descending order and take the first one
    const newestChecklist =
      newerChecklists.sort(
        (a, b) => new Date(b.version).getTime() - new Date(a.version).getTime()
      )[0] || null

    return newestChecklist
  }
)
