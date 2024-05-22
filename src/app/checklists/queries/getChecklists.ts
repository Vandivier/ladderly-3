import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetChecklistsInput
  extends Pick<
    Prisma.ChecklistFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetChecklistsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: checklists,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.checklist.count({ where }),
      query: (paginateArgs) =>
        db.checklist.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      checklists,
      nextPage,
      hasMore,
      count,
    }
  }
)
