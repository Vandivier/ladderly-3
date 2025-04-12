import { JobApplicationStatus } from '@prisma/client'
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

const JobPostForCandidateCreateSchema = z.object({
  jobSearchId: z.number(),
  company: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  jobPostUrl: z.string().optional(),
  resumeVersion: z.string().optional(),
  initialOutreachDate: z.date().optional(),
  initialApplicationDate: z.date().optional(),
  lastActionDate: z.date().optional(),
  contactName: z.string().optional(),
  contactUrl: z.string().optional(),
  hasReferral: z.boolean().default(false),
  isInboundOpportunity: z.boolean().default(false),
  notes: z.string().optional(),
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

  // Create a new job post for candidate
  createJobPostForCandidate: protectedProcedure
    .input(JobPostForCandidateCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id)
      const { jobSearchId, ...jobData } = input

      // Check if the job search exists and belongs to the user
      const jobSearch = await ctx.db.jobSearch.findUnique({
        where: { id: jobSearchId },
      })

      if (!jobSearch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Job search not found',
        })
      }

      if (jobSearch.userId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to add to this job search',
        })
      }

      // Create the job post with only the fields that exist in the schema
      const jobPost = await ctx.db.jobPostForCandidate.create({
        data: {
          company: jobData.company,
          jobTitle: jobData.jobTitle,
          jobPostUrl: jobData.jobPostUrl,
          resumeVersion: jobData.resumeVersion,
          initialOutreachDate: jobData.initialOutreachDate,
          initialApplicationDate: jobData.initialApplicationDate,
          lastActionDate: jobData.lastActionDate,
          contactName: jobData.contactName,
          contactUrl: jobData.contactUrl,
          hasReferral: jobData.hasReferral,
          isInboundOpportunity: jobData.isInboundOpportunity,
          notes: jobData.notes,
          jobSearchId,
          status: JobApplicationStatus.APPLIED,
        },
      })

      return jobPost
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

  // Delete a job post
  deleteJobPost: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id)

      // Find the job post and verify ownership through the job search
      const jobPost = await ctx.db.jobPostForCandidate.findUnique({
        where: { id: input.id },
        include: {
          jobSearch: true,
        },
      })

      if (!jobPost) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Job post not found',
        })
      }

      // Check if the job search belongs to the current user
      if (jobPost.jobSearch.userId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this job post',
        })
      }

      // Delete any job search steps first, then the job post
      await ctx.db.$transaction([
        ctx.db.jobSearchStep.deleteMany({
          where: {
            jobPostId: input.id,
          },
        }),
        ctx.db.jobPostForCandidate.delete({
          where: { id: input.id },
        }),
      ])

      return { success: true }
    }),
})
