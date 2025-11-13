import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import {
  createTRPCRouter,
  protectedProcedureWithVerifiedEmail,
} from '~/server/api/trpc'
import {
  JobSearchCreateSchema,
  JobSearchUpdateSchema,
  GetJobSearchInputSchema,
} from './schemas'
import { csvRouter } from './csv.router'
import { jobPostRouter } from './jobPost.router'
import { jobStepRouter } from './jobStep.router'

export const jobSearchRouter = createTRPCRouter({
  // --- Job Search CRUD ---

  // Get all job searches for the current user
  getUserJobSearches: protectedProcedureWithVerifiedEmail
    .input(
      z
        .object({
          includeInactive: z.boolean().optional().default(false),
          page: z.number().optional().default(1),
          pageSize: z.number().optional().default(10),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id)
      const page = input?.page ?? 1
      const pageSize = input?.pageSize ?? 10
      const skip = (page - 1) * pageSize

      const where = {
        userId,
        ...(input?.includeInactive ? {} : { isActive: true }),
      }

      // Get total count and paginated results in parallel for efficiency
      const [totalItems, jobSearches] = await Promise.all([
        ctx.db.jobSearch.count({ where }),
        ctx.db.jobSearch.findMany({
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
          skip,
          take: pageSize,
        }),
      ])

      const totalPages = Math.ceil(totalItems / pageSize)

      return {
        jobSearches,
        pagination: {
          totalItems,
          currentPage: page,
          pageSize,
          totalPages,
        },
      }
    }),

  // Get a single job search by ID (including paginated job posts)
  getJobSearch: protectedProcedureWithVerifiedEmail
    .input(GetJobSearchInputSchema) // Use imported schema
    .query(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id)
      const { id, page, pageSize } = input

      const skip = (page - 1) * pageSize

      // Fetch JobSearch and total count of job posts in parallel
      const [jobSearch, totalJobPosts] = await ctx.db.$transaction([
        ctx.db.jobSearch.findUnique({
          where: { id },
          include: {
            // Fetch only the requested page of job posts
            jobPosts: {
              skip: skip,
              take: pageSize,
              include: {
                jobSearchSteps: true, // Keep includes if needed
              },
              orderBy: {
                updatedAt: 'desc',
              },
            },
          },
        }),
        ctx.db.jobPostForCandidate.count({
          where: { jobSearchId: id },
        }),
      ])

      if (!jobSearch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Job search not found',
        })
      }

      if (jobSearch.userId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this job search',
        })
      }

      // Return job search data along with pagination info
      return {
        ...jobSearch,
        pagination: {
          totalItems: totalJobPosts,
          currentPage: page,
          pageSize: pageSize,
          totalPages: Math.ceil(totalJobPosts / pageSize),
        },
      }
    }),

  // Create a new job search
  createJobSearch: protectedProcedureWithVerifiedEmail
    .input(JobSearchCreateSchema) // Use imported schema
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
  updateJobSearch: protectedProcedureWithVerifiedEmail
    .input(JobSearchUpdateSchema) // Use imported schema
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
  deleteJobSearch: protectedProcedureWithVerifiedEmail
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

  getJobSearchAnalytics: protectedProcedureWithVerifiedEmail
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Ensure we have a valid user ID
      const userId = ctx.session?.user?.id ? parseInt(ctx.session.user.id) : 0

      const jobSearch = await ctx.db.jobSearch.findUnique({
        where: {
          id: input.id,
          userId,
        },
        include: {
          jobPosts: true,
        },
      })

      if (!jobSearch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Job search not found',
        })
      }

      // Process data for weekly applications
      const applicationsByWeek = new Map<string, number>()

      // Process each job post to gather weekly data
      jobSearch.jobPosts.forEach((post) => {
        // Use the application date or fallback to created date
        const dateValue = post.initialApplicationDate ?? post.createdAt

        // Get the start of the week (Sunday)
        const weekDate = new Date(dateValue)
        const day = weekDate.getDay()
        weekDate.setDate(weekDate.getDate() - day)
        weekDate.setHours(0, 0, 0, 0)

        const isoString = weekDate.toISOString()
        const parts = isoString.split('T')
        if (parts.length === 0 || typeof parts[0] !== 'string') {
          throw new Error(`Failed to parse date: ${isoString}`)
        }
        const weekKey = parts[0]

        applicationsByWeek.set(
          weekKey,
          (applicationsByWeek.get(weekKey) ?? 0) + 1,
        )
      })

      // Convert to array and sort by week
      const weeklyData = Array.from(applicationsByWeek.entries())
        .map(([weekStart, count]) => ({ weekStart, count }))
        .sort((a, b) => a.weekStart.localeCompare(b.weekStart))

      return {
        id: jobSearch.id,
        name: jobSearch.name,
        totalApplications: jobSearch.jobPosts.length,
        weeklyData,
      }
    }),

  // --- Merge Sub-Routers ---
  csv: csvRouter, // Namespace: jobSearch.csv.*
  jobPost: jobPostRouter, // Namespace: jobSearch.jobPost.*
  jobStep: jobStepRouter, // Namespace: jobSearch.jobStep.*
})
