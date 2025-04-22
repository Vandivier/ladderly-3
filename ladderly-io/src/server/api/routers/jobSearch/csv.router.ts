import type { Prisma } from '@prisma/client'
import { JobApplicationStatus } from '@prisma/client'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { JobSearchCreateFromCsvSchema } from './schemas'
import { mapCsvStatusToEnum } from './csv.helpers'

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
})
