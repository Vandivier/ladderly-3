import type { IntroJobFamily, JobBoardContactType } from '@prisma/client'

export const INTRO_JOB_FAMILY_LABELS: Record<IntroJobFamily, string> = {
  INDIVIDUAL_CONTRIBUTOR: 'Individual Contributor',
  ENGINEERING_MANAGER: 'Engineering Manager',
  TECHNICAL_RECRUITER: 'Technical Recruiter',
}

export const CONTACT_TYPE_LABELS: Record<JobBoardContactType, string> = {
  POSTER: 'Direct Contact',
  NETWORK_INTRO: 'Intro Available',
}

export const describeContactBadge = (
  contactType: JobBoardContactType,
  introJobFamilies: IntroJobFamily[],
): string => {
  if (contactType === 'POSTER') return CONTACT_TYPE_LABELS.POSTER

  const families = introJobFamilies
    .map((family) => INTRO_JOB_FAMILY_LABELS[family])
    .join(', ')

  return families
    ? `${CONTACT_TYPE_LABELS.NETWORK_INTRO}: ${families}`
    : CONTACT_TYPE_LABELS.NETWORK_INTRO
}

const formatSalary = (value: number): string =>
  value >= 1000 && value % 1000 === 0
    ? `$${value / 1000}k`
    : `$${value.toLocaleString()}`

export const formatSalaryRange = (
  baseSalaryMin: number | null,
  baseSalaryMax: number | null,
): string | null => {
  if (baseSalaryMin !== null && baseSalaryMax !== null) {
    return baseSalaryMin === baseSalaryMax
      ? formatSalary(baseSalaryMin)
      : `${formatSalary(baseSalaryMin)}–${formatSalary(baseSalaryMax)}`
  }
  if (baseSalaryMin !== null) return `${formatSalary(baseSalaryMin)}+`
  if (baseSalaryMax !== null) return `Up to ${formatSalary(baseSalaryMax)}`
  return null
}

export const formatPosterName = (author: {
  nameFirst: string
  nameLast: string
}): string => {
  const name = `${author.nameFirst} ${author.nameLast}`.trim()
  return name === '' ? 'Ladderly Member' : name
}
