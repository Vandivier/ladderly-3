import type { User } from '@prisma/client'

export type JobPostEligibilityFields = Pick<
  User,
  'hasPublicProfileEnabled' | 'profileLinkedInUri' | 'profileContactEmail'
>

// Every job board post is transparently attached to a real person, so posters
// must have a public profile with public contact data.
export const canPostJobs = (user: JobPostEligibilityFields): boolean =>
  user.hasPublicProfileEnabled &&
  ((user.profileLinkedInUri?.trim() ?? '') !== '' ||
    (user.profileContactEmail?.trim() ?? '') !== '')

export const JOB_POST_ELIGIBILITY_MESSAGE =
  'To post a job, enable your public profile and add a LinkedIn URL or ' +
  'contact email in your settings.'

export const getJobPostExpiryDate = (from: Date = new Date()): Date => {
  const expiryDate = new Date(from)
  expiryDate.setMonth(expiryDate.getMonth() + 1)
  return expiryDate
}
