import { JobApplicationStatus } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import {
  JobPostForCandidateCreateSchema,
  UpdateJobPostStatusSchema,
  JobPostForCandidateUpdateSchema,
} from './schemas'

export const jobPostRouter = createTRPCRouter({
  // Create a new job post for candidate
  create: protectedProcedure
    .input(JobPostForCandidateCreateSchema) // Use imported schema
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

  // Delete a job post
  delete: protectedProcedure
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

  // Get a single job post by ID
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id)

      const jobPost = await ctx.db.jobPostForCandidate.findUnique({
        where: {
          id: input.id,
        },
        include: {
          jobSearch: true,
          jobSearchSteps: {
            orderBy: {
              date: 'desc',
            },
          },
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
          message: 'You do not have permission to access this job post',
        })
      }

      return jobPost
    }),

  // Update job application status
  updateStatus: protectedProcedure
    .input(UpdateJobPostStatusSchema) // Use imported schema
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id)

      // Verify ownership
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

      if (jobPost.jobSearch.userId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this job post',
        })
      }

      // Update status
      const updatedJobPost = await ctx.db.jobPostForCandidate.update({
        where: { id: input.id },
        data: {
          status: input.status,
          lastActionDate: new Date(), // Update last action date
        },
      })

      return updatedJobPost
    }),

  // Update Job Post (general fields)
  update: protectedProcedure
    .input(JobPostForCandidateUpdateSchema) // Use imported schema
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id)
      const { id, ...updateData } = input

      // Verify ownership
      const jobPost = await ctx.db.jobPostForCandidate.findUnique({
        where: { id: id },
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

      if (jobPost.jobSearch.userId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this job post',
        })
      }

      // Automatically update lastActionDate if it wasn't explicitly provided
      const dataToUpdate = {
        ...updateData,
        // Only update lastActionDate if other fields *besides* lastActionDate are being changed
        ...(!updateData.lastActionDate &&
          Object.keys(updateData).length > 0 && {
            lastActionDate: new Date(),
          }),
      }

      // Update the job post
      const updatedJobPost = await ctx.db.jobPostForCandidate.update({
        where: { id: id },
        data: dataToUpdate,
      })

      return updatedJobPost
    }),
})
