import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { JobSearchStepCreateSchema, JobSearchStepUpdateSchema } from './schemas'

export const jobStepRouter = createTRPCRouter({
  // Create a job search step
  create: protectedProcedure
    .input(JobSearchStepCreateSchema) // Use imported schema
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id)

      // Verify job post ownership
      const jobPost = await ctx.db.jobPostForCandidate.findUnique({
        where: { id: input.jobPostId },
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
          message: 'You do not have permission to add steps to this job post',
        })
      }

      // Create the step
      const jobSearchStep = await ctx.db.jobSearchStep.create({
        data: {
          date: input.date,
          kind: input.kind,
          notes: input.notes,
          isPassed: input.isPassed,
          isInPerson: input.isInPerson,
          jobPostId: input.jobPostId,
        },
      })

      // Update the job post's last action date
      await ctx.db.jobPostForCandidate.update({
        where: { id: input.jobPostId },
        data: {
          lastActionDate: new Date(),
        },
      })

      return jobSearchStep
    }),

  // Update a job search step
  update: protectedProcedure
    .input(JobSearchStepUpdateSchema) // Use imported schema
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id)

      // Find the step and verify ownership through job post
      const step = await ctx.db.jobSearchStep.findUnique({
        where: { id: input.id },
        include: {
          jobPost: {
            include: {
              jobSearch: true,
            },
          },
        },
      })

      if (!step) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Job search step not found',
        })
      }

      if (step.jobPost.jobSearch.userId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this step',
        })
      }

      // Update the step
      const updatedStep = await ctx.db.jobSearchStep.update({
        where: { id: input.id },
        data: {
          date: input.date,
          kind: input.kind,
          notes: input.notes,
          isPassed: input.isPassed,
        },
      })

      return updatedStep
    }),

  // Delete a job search step
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id)

      // Find the step and verify ownership through job post
      const step = await ctx.db.jobSearchStep.findUnique({
        where: { id: input.id },
        include: {
          jobPost: {
            include: {
              jobSearch: true,
            },
          },
        },
      })

      if (!step) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Job search step not found',
        })
      }

      if (step.jobPost.jobSearch.userId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this step',
        })
      }

      // Delete the step
      await ctx.db.jobSearchStep.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
