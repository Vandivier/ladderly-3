import { z } from 'zod'
import { JobApplicationStatus, JobSearchStepKind } from '@prisma/client'

export const JobSearchSchema = z.object({
  name: z.string().min(1, 'Job search name is required'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
})

export const JobSearchCreateSchema = JobSearchSchema

export const JobSearchUpdateSchema = JobSearchSchema.partial().extend({
  id: z.number(),
})

export const JobPostForCandidateCreateSchema = z.object({
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
export const UpdateJobPostStatusSchema = z.object({
  id: z.number(),
  status: z.nativeEnum(JobApplicationStatus),
})

// Schema for creating a job search step
export const JobSearchStepCreateSchema = z.object({
  jobPostId: z.number(),
  date: z.date(),
  kind: z.nativeEnum(JobSearchStepKind),
  notes: z.string().optional(),
  isPassed: z.boolean().optional(),
  isInPerson: z.boolean().default(false),
})

// Schema for updating a job search step
export const JobSearchStepUpdateSchema = z.object({
  id: z.number(),
  date: z.date().optional(),
  kind: z.nativeEnum(JobSearchStepKind).optional(),
  notes: z.string().optional(),
  isPassed: z.boolean().optional(),
})

// Schema for a single row parsed from the CSV
// Match column names from temp.csv, handle type conversions
export const JobPostCsvRowSchema = z.object({
  Company: z.string().min(1, 'Company name is required'),
  'Job Post Title': z.string().min(1, 'Job title is required'),
  'Job Post URL': z.string().optional().nullable(),
  'Resume Version': z.string().optional().nullable(),
  'Contact Name': z.string().optional().nullable(), // Added
  ContactUrl: z.string().optional().nullable(), // Added
  Referral: z
    .string()
    .transform(
      (val) => val?.toUpperCase() === 'TRUE' || val?.toUpperCase() === 'YES',
    ) // Adjusted for TRUE/YES
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
    .transform((val) => val?.toUpperCase() === 'TRUE') // Adjusted for TRUE
    .optional(),
  Status: z.string().optional().nullable(), // Added status field
  Salary: z // Added Salary
    .preprocess(
      (val) =>
        val && typeof val === 'string' && val.trim() !== ''
          ? parseInt(val.replace(/[^0-9]/g, ''), 10) // Remove non-numeric chars
          : undefined,
      z.number().int().positive().optional().nullable(),
    )
    .optional(),
  TC: z // Added Total Compensation (TC)
    .preprocess(
      (val) =>
        val && typeof val === 'string' && val.trim() !== ''
          ? parseInt(val.replace(/[^0-9]/g, ''), 10) // Remove non-numeric chars
          : undefined,
      z.number().int().positive().optional().nullable(),
    )
    .optional(),
  Notes: z.string().optional().nullable(),
})

// Schema for the CSV upload mutation input
export const JobSearchCreateFromCsvSchema = z.object({
  name: z.string().min(1, 'Job search name is required'),
  startDate: z.date(),
  isActive: z.boolean().default(true),
  jobPosts: z.array(JobPostCsvRowSchema), // Array of parsed CSV rows
})

// Input Schema for GetJobSearch
export const GetJobSearchInputSchema = z.object({
  id: z.number(),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().optional().default(10), // Default page size
})

// Schema for Updating Job Post
export const JobPostForCandidateUpdateSchema = z
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
