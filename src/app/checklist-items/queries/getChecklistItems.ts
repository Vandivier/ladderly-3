import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetChecklistItemsInput
  extends Pick<
    Prisma.ChecklistItemFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetChecklistItemsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: checklistItems,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.checklistItem.count({ where }),
      query: (paginateArgs) =>
        db.checklistItem.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      checklistItems,
      nextPage,
      hasMore,
      count,
    }
  }
)
