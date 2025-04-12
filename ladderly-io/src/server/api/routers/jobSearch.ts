import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

const JobSearchSchema = z.object({
  name: z.string().min(1, 'Job search name is required'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
})

const JobSearchCreateSchema = JobSearchSchema

const JobSearchUpdateSchema = JobSearchSchema.partial().extend({
  id: z.number(),
})

export const jobSearchRouter = createTRPCRouter({
  // Get all job searches for the current user
  getUserJobSearches: protectedProcedure
    .input(
      z
        .object({
          includeInactive: z.boolean().optional().default(false),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id)

      const where = {
        userId,
        ...(input?.includeInactive ? {} : { isActive: true }),
      }

      const jobSearches = await ctx.db.jobSearch.findMany({
        where,
        orderBy: {
          updatedAt: 'desc',
        },
        include: {
          _count: {
            select: {
              jobPosts: true,
            },
          },
        },
      })

      return jobSearches
    }),

  // Get a single job search by ID
  getJobSearch: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id)

      const jobSearch = await ctx.db.jobSearch.findUnique({
        where: {
          id: input.id,
        },
        include: {
          jobPosts: {
            include: {
              jobSearchSteps: true,
            },
            orderBy: {
              updatedAt: 'desc',
            },
          },
        },
      })

      if (!jobSearch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Job search not found',
        })
      }

      // Check if the job search belongs to the current user
      if (jobSearch.userId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this job search',
        })
      }

      return jobSearch
    }),

  // Create a new job search
  createJobSearch: protectedProcedure
    .input(JobSearchCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id)

      const jobSearch = await ctx.db.jobSearch.create({
        data: {
          ...input,
          userId,
        },
      })

      return jobSearch
    }),

  // Update an existing job search
  updateJobSearch: protectedProcedure
    .input(JobSearchUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id)
      const { id, ...data } = input

      // Check if the job search exists and belongs to the user
      const existingJobSearch = await ctx.db.jobSearch.findUnique({
        where: { id },
      })

      if (!existingJobSearch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Job search not found',
        })
      }

      if (existingJobSearch.userId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this job search',
        })
      }

      const updatedJobSearch = await ctx.db.jobSearch.update({
        where: { id },
        data,
      })

      return updatedJobSearch
    }),

  // Delete a job search
  deleteJobSearch: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id)

      // Check if the job search exists and belongs to the user
      const existingJobSearch = await ctx.db.jobSearch.findUnique({
        where: { id: input.id },
      })

      if (!existingJobSearch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Job search not found',
        })
      }

      if (existingJobSearch.userId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this job search',
        })
      }

      // Delete all related job posts and their steps using a transaction
      await ctx.db.$transaction([
        ctx.db.jobSearchStep.deleteMany({
          where: {
            jobPost: {
              jobSearchId: input.id,
            },
          },
        }),
        ctx.db.jobPostForCandidate.deleteMany({
          where: {
            jobSearchId: input.id,
          },
        }),
        ctx.db.jobSearch.delete({
          where: { id: input.id },
        }),
      ])

      return { success: true }
    }),
})
