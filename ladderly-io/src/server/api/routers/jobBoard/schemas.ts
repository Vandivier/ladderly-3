import { z } from 'zod'
import { IntroJobFamily, JobBoardContactType } from '@prisma/client'

const optionalUrlValidator = z
  .string()
  .refine((value) => value === '' || value.startsWith('http'), {
    message: 'Invalid URL',
  })
  .nullish()

// Base schema is intentionally unrefined so update can derive via .partial()
export const JobBoardPostBaseSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required').max(120),
  jobTitle: z.string().trim().min(1, 'Job title is required').max(120),
  description: z.string().max(5000).nullish(),
  jobPostUrl: optionalUrlValidator,
  location: z.string().max(120).default(''),
  isRemote: z.boolean().default(false),
  baseSalaryMin: z.number().int().nonnegative().nullish(),
  baseSalaryMax: z.number().int().nonnegative().nullish(),
  contactType: z.nativeEnum(JobBoardContactType),
  introJobFamilies: z.array(z.nativeEnum(IntroJobFamily)).default([]),
})

const validateJobBoardPostRules = (
  data: {
    contactType?: JobBoardContactType
    introJobFamilies?: IntroJobFamily[]
    baseSalaryMin?: number | null
    baseSalaryMax?: number | null
  },
  ctx: z.RefinementCtx,
) => {
  if (
    data.contactType === JobBoardContactType.NETWORK_INTRO &&
    (data.introJobFamilies?.length ?? 0) === 0
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['introJobFamilies'],
      message:
        'Select at least one job family you are willing to intro candidates to.',
    })
  }

  if (
    typeof data.baseSalaryMin === 'number' &&
    typeof data.baseSalaryMax === 'number' &&
    data.baseSalaryMin > data.baseSalaryMax
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['baseSalaryMin'],
      message: 'Minimum base salary cannot exceed the maximum.',
    })
  }
}

export const JobBoardPostCreateSchema = JobBoardPostBaseSchema.superRefine(
  validateJobBoardPostRules,
)

export const JobBoardPostUpdateSchema = JobBoardPostBaseSchema.partial()
  .extend({ id: z.number() })
  .superRefine(validateJobBoardPostRules)

export const JobBoardSortBy = z.enum(['newest', 'salaryDesc'])

export const GetJobBoardPostsSchema = z.object({
  skip: z.number().int().nonnegative().optional().default(0),
  take: z.number().int().positive().max(50).optional().default(10),
  searchTerm: z.string().max(120).optional(),
  contactType: z.nativeEnum(JobBoardContactType).optional(),
  introJobFamily: z.nativeEnum(IntroJobFamily).optional(),
  minSalary: z.number().int().nonnegative().optional(),
  sortBy: JobBoardSortBy.optional().default('newest'),
})
