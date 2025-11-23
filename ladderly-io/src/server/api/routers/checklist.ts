import { z } from 'zod'
import {
  createTRPCRouter,
  protectedProcedure,
  protectedProcedureWithVerifiedEmail,
  publicProcedure,
  isAuthedOrInternalMiddleware,
} from '~/server/api/trpc'
import { db } from '~/server/db'
import { TRPCError } from '@trpc/server'

export const checklistRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.checklist.findUnique({
        where: { id: input.id },
      })
    }),

  getByPrettyRoute: publicProcedure
    .input(z.object({ prettyRoute: z.string() }))
    .query(async ({ input }) => {
      return db.checklist.findFirst({
        where: {
          prettyRoute: input.prettyRoute,
          publishedAt: {
            not: null,
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
      })
    }),

  getChecklistForUser: protectedProcedureWithVerifiedEmail
    .input(z.object({ checklistId: z.number() }))
    .query(async ({ input, ctx }) => {
      const checklist = await db.checklist.findUnique({
        where: { id: input.checklistId },
        include: { checklistItems: true },
      })

      if (!checklist) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Checklist not found',
        })
      }

      let userChecklist = await db.userChecklist.findUnique({
        where: {
          userId_checklistId: {
            userId: parseInt(ctx.session.user.id),
            checklistId: input.checklistId,
          },
        },
        include: {
          checklist: true,
          userChecklistItems: {
            include: {
              checklistItem: true,
            },
            orderBy: {
              checklistItem: {
                displayIndex: 'asc',
              },
            },
          },
        },
      })

      // If no user checklist exists or it has no items, create/recreate it
      if (!userChecklist || userChecklist.userChecklistItems.length === 0) {
        // If exists but has no items, delete it first to ensure clean state
        if (userChecklist) {
          await db.userChecklist.delete({
            where: { id: userChecklist.id },
          })
        }

        // Create new user checklist
        const newUserChecklist = await db.userChecklist.create({
          data: {
            userId: parseInt(ctx.session.user.id),
            checklistId: input.checklistId,
          },
        })

        // Create user checklist items
        await db.userChecklistItem.createMany({
          data: checklist.checklistItems.map((item) => ({
            isComplete: false,
            checklistItemId: item.id,
            userChecklistId: newUserChecklist.id,
            userId: parseInt(ctx.session.user.id),
          })),
        })

        // Fetch the complete user checklist with items
        userChecklist = await db.userChecklist.findUnique({
          where: { id: newUserChecklist.id },
          include: {
            checklist: true,
            userChecklistItems: {
              include: {
                checklistItem: true,
              },
              orderBy: {
                checklistItem: {
                  displayIndex: 'asc',
                },
              },
            },
          },
        })
      } else {
        await db.userChecklist.update({
          where: { id: userChecklist.id },
          data: {
            updatedAt: new Date(),
          },
        })
      }

      if (!userChecklist) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not find or create user checklist',
        })
      }

      return userChecklist
    }),

  getLatestByName: protectedProcedureWithVerifiedEmail
    .input(z.object({ name: z.string() }))
    .query(async ({ input, ctx }) => {
      const latestChecklist = await db.checklist.findFirst({
        where: {
          name: input.name,
        },
        orderBy: {
          version: 'desc',
        },
        include: {
          checklistItems: {
            orderBy: {
              displayIndex: 'asc',
            },
          },
        },
      })

      if (!latestChecklist) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Checklist not found',
        })
      }

      let userChecklist = await db.userChecklist.findFirst({
        where: {
          userId: parseInt(ctx.session.user.id),
          checklist: {
            name: input.name,
          },
        },
        include: {
          checklist: true,
          userChecklistItems: {
            include: {
              checklistItem: true,
            },
            orderBy: {
              checklistItem: {
                displayIndex: 'asc',
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      // If no user checklist exists or it has no items, create/recreate it
      if (!userChecklist || userChecklist.userChecklistItems.length === 0) {
        // If exists but has no items, delete it first
        if (userChecklist) {
          await db.userChecklist.delete({
            where: { id: userChecklist.id },
          })
        }

        // Create new user checklist
        const newUserChecklist = await db.userChecklist.create({
          data: {
            userId: parseInt(ctx.session.user.id),
            checklistId: latestChecklist.id,
          },
          include: {
            checklist: true,
            userChecklistItems: true,
          },
        })

        // Create user checklist items
        await db.userChecklistItem.createMany({
          data: latestChecklist.checklistItems.map((item) => ({
            isComplete: false,
            checklistItemId: item.id,
            userChecklistId: newUserChecklist.id,
            userId: parseInt(ctx.session.user.id),
          })),
        })

        // Fetch the complete user checklist with items
        userChecklist = await db.userChecklist.findUnique({
          where: { id: newUserChecklist.id },
          include: {
            checklist: true,
            userChecklistItems: {
              include: {
                checklistItem: true,
              },
              orderBy: {
                checklistItem: {
                  displayIndex: 'asc',
                },
              },
            },
          },
        })
      }

      return {
        userChecklistCascade: {
          userChecklist,
        },
        latestChecklistId: latestChecklist.id,
      }
    }),

  createAsClone: protectedProcedureWithVerifiedEmail
    .input(z.object({ checklistId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const checklist = await db.checklist.findUnique({
        where: { id: input.checklistId },
        include: { checklistItems: true },
      })

      if (!checklist) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Checklist not found',
        })
      }

      // Create the user checklist
      const userChecklist = await db.userChecklist.create({
        data: {
          userId: parseInt(ctx.session.user.id),
          checklistId: checklist.id,
        },
      })

      // Create user checklist items
      await db.userChecklistItem.createMany({
        data: checklist.checklistItems.map((item) => ({
          isComplete: false,
          checklistItemId: item.id,
          userChecklistId: userChecklist.id,
          userId: parseInt(ctx.session.user.id),
        })),
      })

      // Fetch the complete user checklist with items
      const completeUserChecklist = await db.userChecklist.findUnique({
        where: { id: userChecklist.id },
        include: {
          checklist: true,
          userChecklistItems: {
            include: {
              checklistItem: true,
            },
            orderBy: {
              checklistItem: {
                displayIndex: 'asc',
              },
            },
          },
        },
      })

      if (!completeUserChecklist) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create checklist',
        })
      }

      return {
        userChecklist: completeUserChecklist,
      }
    }),

  toggleItem: protectedProcedureWithVerifiedEmail
    .input(
      z.object({
        userChecklistItemId: z.number(),
        isComplete: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const item = await db.userChecklistItem.findUnique({
        where: { id: input.userChecklistItemId },
      })

      if (item?.userId !== parseInt(ctx.session.user.id)) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Checklist item not found',
        })
      }

      const updatedItem = await db.userChecklistItem.update({
        where: { id: input.userChecklistItemId },
        data: { isComplete: input.isComplete },
        include: {
          checklistItem: true,
        },
      })

      await db.userChecklist.update({
        where: { id: item.userChecklistId },
        data: { updatedAt: new Date() },
      })

      return updatedItem
    }),

  list: publicProcedure
    .input(
      z.object({
        internalSecret: z.string().optional(),
      }),
    )
    .use(isAuthedOrInternalMiddleware)
    .query(async () => {
      const checklists = await db.checklist.findMany({
        orderBy: { name: 'asc' },
        where: {
          publishedAt: {
            not: null,
          },
        },
      })

      return {
        checklists,
      }
    }),

  getRecentChecklists: protectedProcedure.query(async ({ ctx }) => {
    const recentChecklists = await db.userChecklist.findMany({
      where: {
        userId: parseInt(ctx.session.user.id),
      },
      include: {
        checklist: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 3,
    })

    return recentChecklists.map((uc) => ({
      id: uc.checklist.id,
      name: uc.checklist.name,
      prettyRoute: uc.checklist.prettyRoute,
      lastAccessed: uc.updatedAt,
    }))
  }),
})
