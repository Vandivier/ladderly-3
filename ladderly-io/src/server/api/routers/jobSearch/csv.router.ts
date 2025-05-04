import type { Prisma } from '@prisma/client'
import { JobApplicationStatus, JobSearchStepKind } from '@prisma/client'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { JobSearchCreateFromCsvSchema } from './schemas'
import { mapCsvStatusToEnum } from './csv.helpers'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

// Helper function to map string to JobSearchStepKind enum
function mapToStepKind(kind: string): JobSearchStepKind {
  // Upper case and normalize the input
  const normalized = kind.toUpperCase().replace(/\s+/g, '_')

  // Check if it's a valid enum value
  if (
    Object.values(JobSearchStepKind).includes(normalized as JobSearchStepKind)
  ) {
    return normalized as JobSearchStepKind
  }

  // Handle common variations
  switch (normalized) {
    case 'TECHNICAL':
      return JobSearchStepKind.TECHNICAL_OTHER
    case 'BEHAVIORAL':
      return JobSearchStepKind.BEHAVIORAL_INTERVIEW
    case 'PHONE':
      return JobSearchStepKind.PHONE_SCREEN
    case 'HIRING_MANAGER':
      return JobSearchStepKind.HIRING_MANAGER_CALL
    case 'APPLICATION':
      return JobSearchStepKind.INITIAL_APPLICATION
    default:
      return JobSearchStepKind.OTHER
  }
}

export const csvRouter = createTRPCRouter({
  createFromCsv: protectedProcedure
    .input(JobSearchCreateFromCsvSchema) // Use imported schema
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id)

      // 1. Create the Job Search
      const newJobSearch = await ctx.db.jobSearch.create({
        data: {
          name: input.name,
          startDate: input.startDate,
          isActive: input.isActive,
          userId: userId,
        },
      })

      // 2. Prepare Job Post data from CSV rows
      const jobPostsToCreate: Prisma.JobPostForCandidateCreateManyInput[] =
        input.jobPosts.map((row) => ({
          company: row.Company,
          jobTitle: row['Job Post Title'],
          jobPostUrl: row['Job Post URL'] ?? undefined,
          resumeVersion: row['Resume Version'] ?? undefined,
          contactName: row['Contact Name'] ?? undefined,
          contactUrl: row.ContactUrl ?? undefined,
          hasReferral: row.Referral ?? false,
          initialOutreachDate: row['Initial Outreach Date'] ?? undefined,
          initialApplicationDate: row['Initial App Date'] ?? undefined,
          lastActionDate: row['Last Action Date'] ?? undefined,
          isInboundOpportunity: row['Inbound Opportunity'] ?? false,
          notes: row.Notes ?? undefined,
          status:
            mapCsvStatusToEnum(row.Status) ?? JobApplicationStatus.APPLIED, // Use imported helper
          baseSalary: row.Salary ?? undefined,
          totalCompensation: row.TC ?? undefined,
          jobSearchId: newJobSearch.id,
        }))

      // 3. Bulk create Job Posts (more efficient than individual creates)
      // Note: createMany doesn't return the created records, only a count.
      const createResult = await ctx.db.jobPostForCandidate.createMany({
        data: jobPostsToCreate,
        skipDuplicates: true, // Optional: skip if a unique constraint fails (e.g., if you add one)
      })

      return {
        success: true,
        jobSearchId: newJobSearch.id,
        jobPostsCreated: createResult.count,
      }
    }),

  createRoundLevelFromCsv: protectedProcedure
    .input(
      z.object({
        jobSearchId: z.number(),
        roundLevelData: z.array(
          z.object({
            JobPostId: z.number().optional(),
            Company: z.string(),
            'Job Post Title': z.string(),
            'Step Date': z.string(),
            'Step Kind': z.string(),
            'Is Passed': z.string().optional(),
            'Is In Person': z.string().optional(),
            Notes: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id)

      // Verify the job search exists and belongs to the user
      const jobSearch = await ctx.db.jobSearch.findUnique({
        where: {
          id: input.jobSearchId,
          userId,
        },
      })

      if (!jobSearch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            'Job search not found or you do not have permission to access it',
        })
      }

      let createdSteps = 0
      let createdPosts = 0

      // Process each round level entry
      for (const row of input.roundLevelData) {
        let jobPostId = row.JobPostId

        // If no jobPostId is provided, we need to create or find a matching job post
        if (!jobPostId) {
          // Look for an existing job post matching the company and title
          const existingPost = await ctx.db.jobPostForCandidate.findFirst({
            where: {
              jobSearchId: input.jobSearchId,
              company: row.Company,
              jobTitle: row['Job Post Title'],
            },
          })

          if (existingPost) {
            jobPostId = existingPost.id
          } else {
            // Create a new job post if none exists
            const newPost = await ctx.db.jobPostForCandidate.create({
              data: {
                company: row.Company,
                jobTitle: row['Job Post Title'],
                jobSearchId: input.jobSearchId,
                hasReferral: false,
                isInboundOpportunity: false,
                status: JobApplicationStatus.APPLIED, // Default status
              },
            })
            jobPostId = newPost.id
            createdPosts++
          }
        }

        // Parse the date
        let stepDate: Date
        try {
          stepDate = new Date(row['Step Date'])
          if (isNaN(stepDate.getTime())) {
            throw new Error('Invalid date')
          }
        } catch (error) {
          console.error(`Invalid date format for step: ${row['Step Date']}`)
          stepDate = new Date() // Default to current date if invalid
        }

        // Parse isPassed to boolean
        let isPassed: boolean | null = null
        if (row['Is Passed']) {
          const passed = row['Is Passed'].toLowerCase()
          if (
            passed === 'true' ||
            passed === 'yes' ||
            passed === 'y' ||
            passed === '1'
          ) {
            isPassed = true
          } else if (
            passed === 'false' ||
            passed === 'no' ||
            passed === 'n' ||
            passed === '0'
          ) {
            isPassed = false
          }
        }

        // Parse isInPerson to boolean
        let isInPerson = false
        if (row['Is In Person']) {
          const inPerson = row['Is In Person'].toLowerCase()
          isInPerson =
            inPerson === 'true' ||
            inPerson === 'yes' ||
            inPerson === 'y' ||
            inPerson === '1'
        }

        // Map step kind string to the enum value
        const stepKind = mapToStepKind(row['Step Kind'])

        // Create the job search step
        await ctx.db.jobSearchStep.create({
          data: {
            date: stepDate,
            kind: stepKind,
            notes: row.Notes || null,
            isPassed,
            isInPerson,
            jobPostId,
          },
        })
        createdSteps++
      }

      return {
        success: true,
        createdPosts,
        createdSteps,
      }
    }),

  downloadRoundLevelCsv: protectedProcedure
    .input(
      z.object({
        jobSearchId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id)

      // Verify the job search exists and belongs to the user
      const jobSearch = await ctx.db.jobSearch.findUnique({
        where: {
          id: input.jobSearchId,
          userId,
        },
        include: {
          jobPosts: {
            include: {
              jobSearchSteps: true,
            },
          },
        },
      })

      if (!jobSearch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            'Job search not found or you do not have permission to access it',
        })
      }

      // Format data for CSV export - round level format
      const roundLevelData = []

      for (const jobPost of jobSearch.jobPosts) {
        // If job post has no steps, add a row for just the job post
        if (!jobPost.jobSearchSteps || jobPost.jobSearchSteps.length === 0) {
          roundLevelData.push({
            JobPostId: jobPost.id,
            Company: jobPost.company,
            'Job Post Title': jobPost.jobTitle || '',
            'Step Date': jobPost.initialApplicationDate || jobPost.createdAt,
            'Step Kind': 'INITIAL_APPLICATION',
            'Is Passed': null,
            'Is In Person': false,
            Notes: jobPost.notes || '',
            Status: jobPost.status,
            'Job Post URL': jobPost.jobPostUrl || '',
            'Resume Version': jobPost.resumeVersion || '',
            'Contact Name': jobPost.contactName || '',
            ContactUrl: jobPost.contactUrl || '',
            'Initial Outreach Date': jobPost.initialOutreachDate || '',
            'Initial App Date': jobPost.initialApplicationDate || '',
            'Last Action Date': jobPost.lastActionDate || '',
            Referral: jobPost.hasReferral ? 'TRUE' : 'FALSE',
            'Inbound Opportunity': jobPost.isInboundOpportunity
              ? 'TRUE'
              : 'FALSE',
            Salary: jobPost.baseSalary || '',
            TC: jobPost.totalCompensation || '',
          })
        } else {
          // Add a row for each step
          for (const step of jobPost.jobSearchSteps) {
            roundLevelData.push({
              JobPostId: jobPost.id,
              Company: jobPost.company,
              'Job Post Title': jobPost.jobTitle || '',
              'Step Date': step.date,
              'Step Kind': step.kind,
              'Is Passed':
                step.isPassed === null ? '' : step.isPassed ? 'TRUE' : 'FALSE',
              'Is In Person': step.isInPerson ? 'TRUE' : 'FALSE',
              Notes: step.notes || '',
              Status: jobPost.status,
              'Job Post URL': jobPost.jobPostUrl || '',
              'Resume Version': jobPost.resumeVersion || '',
              'Contact Name': jobPost.contactName || '',
              ContactUrl: jobPost.contactUrl || '',
              'Initial Outreach Date': jobPost.initialOutreachDate || '',
              'Initial App Date': jobPost.initialApplicationDate || '',
              'Last Action Date': jobPost.lastActionDate || '',
              Referral: jobPost.hasReferral ? 'TRUE' : 'FALSE',
              'Inbound Opportunity': jobPost.isInboundOpportunity
                ? 'TRUE'
                : 'FALSE',
              Salary: jobPost.baseSalary || '',
              TC: jobPost.totalCompensation || '',
            })
          }
        }
      }

      return {
        jobSearchName: jobSearch.name,
        roundLevelData,
      }
    }),
})
