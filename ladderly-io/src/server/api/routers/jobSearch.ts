import type { Prisma } from '@prisma/client'
import { JobApplicationStatus, JobSearchStepKind } from '@prisma/client'
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

// Schema for updating job application status
const UpdateJobPostStatusSchema = z.object({
  id: z.number(),
  status: z.nativeEnum(JobApplicationStatus),
})

// Schema for creating a job search step
const JobSearchStepCreateSchema = z.object({
  jobPostId: z.number(),
  date: z.date(),
  kind: z.nativeEnum(JobSearchStepKind),
  notes: z.string().optional(),
  isPassed: z.boolean().optional(),
  isInPerson: z.boolean().default(false),
})

// Schema for updating a job search step
const JobSearchStepUpdateSchema = z.object({
  id: z.number(),
  date: z.date().optional(),
  kind: z.nativeEnum(JobSearchStepKind).optional(),
  notes: z.string().optional(),
  isPassed: z.boolean().optional(),
})

// Schema for a single row parsed from the CSV
// Match column names from temp.csv, handle type conversions
const JobPostCsvRowSchema = z.object({
  Company: z.string().min(1, 'Company name is required'),
  'Job Post Title': z.string().min(1, 'Job title is required'),
  'Job Post URL': z.string().optional().nullable(),
  'Resume Version': z.string().optional().nullable(),
  // ContactRole: z.string().optional(), // Skipping for now as it's not on JobPostForCandidate
  Referral: z
    .string()
    .transform((val) => val.toUpperCase() === 'YES')
    .optional(),
  'Initial Outreach Date': z.preprocess((arg) => {
    if (!arg || typeof arg !== 'string') return undefined
    try {
      return new Date(arg)
    } catch {
      return undefined
    }
  }, z.date().optional().nullable()),
  'Initial App Date': z.preprocess((arg) => {
    if (!arg || typeof arg !== 'string') return undefined
    try {
      return new Date(arg)
    } catch {
      return undefined
    }
  }, z.date().optional().nullable()),
  'Last Action Date': z.preprocess((arg) => {
    if (!arg || typeof arg !== 'string') return undefined
    try {
      return new Date(arg)
    } catch {
      return undefined
    }
  }, z.date().optional().nullable()),
  'Inbound Opportunity': z
    .string()
    .transform((val) => val.toUpperCase() === 'TRUE')
    .optional(),
  // Skipping EM Email related fields for now
  // Status: z.string().optional(), // We'll default status, maybe parse later if needed
  // Salary: z.string().optional(), // Not directly mapped
  // TC: z.string().optional(), // Not directly mapped
  Notes: z.string().optional().nullable(),
})

// Schema for the CSV upload mutation input
const JobSearchCreateFromCsvSchema = z.object({
  name: z.string().min(1, 'Job search name is required'),
  startDate: z.date(),
  isActive: z.boolean().default(true),
  jobPosts: z.array(JobPostCsvRowSchema), // Array of parsed CSV rows
})

// --- New Input Schema for GetJobSearch ---
const GetJobSearchInputSchema = z.object({
  id: z.number(),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().optional().default(10), // Default page size
})

// --- New Schema for Updating Job Post ---
const JobPostForCandidateUpdateSchema = z
  .object({
    id: z.number(), // ID of the job post to update
    company: z.string().min(1, 'Company name is required').optional(),
    jobTitle: z.string().min(1, 'Job title is required').optional(),
    jobPostUrl: z.string().nullable().optional(),
    resumeVersion: z.string().nullable().optional(),
    initialOutreachDate: z.date().nullable().optional(),
    initialApplicationDate: z.date().nullable().optional(),
    lastActionDate: z.date().nullable().optional(),
    contactName: z.string().nullable().optional(),
    contactUrl: z.string().nullable().optional(),
    hasReferral: z.boolean().optional(),
    isInboundOpportunity: z.boolean().optional(),
    notes: z.string().nullable().optional(),
    status: z.nativeEnum(JobApplicationStatus).optional(), // Allow status update too
  })
  .partial({
    // Make all fields optional except id - Zod >= 3.21 needed
    company: true,
    jobTitle: true,
    jobPostUrl: true,
    resumeVersion: true,
    initialOutreachDate: true,
    initialApplicationDate: true,
    lastActionDate: true,
    contactName: true,
    contactUrl: true,
    hasReferral: true,
    isInboundOpportunity: true,
    notes: true,
    status: true,
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
    .input(GetJobSearchInputSchema) // Use updated input schema
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
            // Remove _count from here if it existed
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

  // Get a single job post by ID
  getJobPost: protectedProcedure
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
  updateJobPostStatus: protectedProcedure
    .input(UpdateJobPostStatusSchema)
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

  // CRUD operations for JobSearchStep

  // Create a job search step
  createJobSearchStep: protectedProcedure
    .input(JobSearchStepCreateSchema)
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
  updateJobSearchStep: protectedProcedure
    .input(JobSearchStepUpdateSchema)
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
  deleteJobSearchStep: protectedProcedure
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

  // --- New Mutation for CSV Import ---
  createJobSearchFromCsv: protectedProcedure
    .input(JobSearchCreateFromCsvSchema)
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
          hasReferral: row.Referral ?? false,
          initialOutreachDate: row['Initial Outreach Date'] ?? undefined,
          initialApplicationDate: row['Initial App Date'] ?? undefined,
          lastActionDate: row['Last Action Date'] ?? undefined,
          isInboundOpportunity: row['Inbound Opportunity'] ?? false,
          notes: row.Notes ?? undefined,
          status: JobApplicationStatus.APPLIED, // Default status
          jobSearchId: newJobSearch.id, // Link to the created job search
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

  // --- New Mutation for Updating Job Post ---
  updateJobPost: protectedProcedure
    .input(JobPostForCandidateUpdateSchema)
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
