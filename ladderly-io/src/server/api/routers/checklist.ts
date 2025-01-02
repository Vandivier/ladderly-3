import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { TRPCError } from "@trpc/server";

export const checklistRouter = createTRPCRouter({
  getLatestByName: protectedProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input, ctx }) => {
      const latestChecklist = await db.checklist.findFirst({
        where: {
          name: input.name,
        },
        orderBy: {
          version: "desc",
        },
        include: {
          checklistItems: {
            orderBy: {
              displayIndex: "asc",
            },
          },
        },
      });

      if (!latestChecklist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Checklist not found",
        });
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
                displayIndex: "asc",
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // If no user checklist exists, create one from the latest checklist
      if (!userChecklist) {
        userChecklist = await db.userChecklist.create({
          data: {
            userId: parseInt(ctx.session.user.id),
            checklistId: latestChecklist.id,
          },
          include: {
            checklist: true,
            userChecklistItems: true,
          },
        });

        // Create user checklist items
        await Promise.all(
          latestChecklist.checklistItems.map((item) =>
            db.userChecklistItem.create({
              data: {
                isComplete: false,
                checklistItemId: item.id,
                userChecklistId: userChecklist!.id,
                userId: parseInt(ctx.session.user.id),
              },
            })
          )
        );

        // Fetch the complete user checklist with items
        userChecklist = await db.userChecklist.findUnique({
          where: { id: userChecklist.id },
          include: {
            checklist: true,
            userChecklistItems: {
              include: {
                checklistItem: true,
              },
              orderBy: {
                checklistItem: {
                  displayIndex: "asc",
                },
              },
            },
          },
        });
      }

      return {
        userChecklistCascade: {
          userChecklist,
        },
        latestChecklistId: latestChecklist.id,
      };
    }),

  createAsClone: protectedProcedure
    .input(z.object({ checklistId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const checklist = await db.checklist.findUnique({
        where: { id: input.checklistId },
        include: { checklistItems: true },
      });

      if (!checklist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Checklist not found",
        });
      }

      // Create the user checklist
      const userChecklist = await db.userChecklist.create({
        data: {
          userId: parseInt(ctx.session.user.id),
          checklistId: checklist.id,
        },
      });

      // Create user checklist items
      await Promise.all(
        checklist.checklistItems.map((item) =>
          db.userChecklistItem.create({
            data: {
              isComplete: false,
              checklistItemId: item.id,
              userChecklistId: userChecklist.id,
              userId: parseInt(ctx.session.user.id),
            },
          })
        )
      );

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
                displayIndex: "asc",
              },
            },
          },
        },
      });

      if (!completeUserChecklist) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checklist",
        });
      }

      return {
        userChecklist: completeUserChecklist,
      };
    }),

  toggleItem: protectedProcedure
    .input(
      z.object({
        userChecklistItemId: z.number(),
        isComplete: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const item = await db.userChecklistItem.findUnique({
        where: { id: input.userChecklistItemId },
      });

      if (!item || item.userId !== parseInt(ctx.session.user.id)) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Checklist item not found",
        });
      }

      return db.userChecklistItem.update({
        where: { id: input.userChecklistItemId },
        data: { isComplete: input.isComplete },
        include: {
          checklistItem: true,
        },
      });
    }),

  list: protectedProcedure
    .input(
      z.object({
        skip: z.number().default(0),
        take: z.number().default(100),
      })
    )
    .query(async ({ input }) => {
      const [checklists, count] = await Promise.all([
        db.checklist.findMany({
          orderBy: { id: "asc" },
          skip: input.skip,
          take: input.take + 1,
        }),
        db.checklist.count(),
      ]);

      const hasMore = checklists.length > input.take;
      if (hasMore) checklists.pop();

      return {
        checklists,
        hasMore,
        count,
      };
    }),
}); 