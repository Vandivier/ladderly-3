import { IntroJobFamily, JobBoardContactType } from '@prisma/client'
import { describe, expect, it } from 'vitest'
import {
  parseSalaryInput,
  toJobBoardPostPayload,
  type JobBoardPostFormValues,
} from '~/app/jobs/components/JobBoardPostForm'
import {
  describeContactBadge,
  formatPosterName,
  formatSalaryRange,
} from '~/app/jobs/utils'

describe('formatSalaryRange', () => {
  it('formats a full range', () => {
    expect(formatSalaryRange(150000, 180000)).toBe('$150k–$180k')
  })

  it('formats non-round numbers with separators', () => {
    expect(formatSalaryRange(150500, null)).toBe('$150,500+')
  })

  it('formats open-ended ranges', () => {
    expect(formatSalaryRange(150000, null)).toBe('$150k+')
    expect(formatSalaryRange(null, 180000)).toBe('Up to $180k')
  })

  it('collapses equal min and max', () => {
    expect(formatSalaryRange(150000, 150000)).toBe('$150k')
  })

  it('returns null when no salary data', () => {
    expect(formatSalaryRange(null, null)).toBeNull()
  })
})

describe('describeContactBadge', () => {
  it('labels direct contact posts', () => {
    expect(describeContactBadge(JobBoardContactType.POSTER, [])).toBe(
      'Direct Contact',
    )
  })

  it('lists intro job families', () => {
    expect(
      describeContactBadge(JobBoardContactType.NETWORK_INTRO, [
        IntroJobFamily.INDIVIDUAL_CONTRIBUTOR,
        IntroJobFamily.TECHNICAL_RECRUITER,
      ]),
    ).toBe('Intro Available: Individual Contributor, Technical Recruiter')
  })
})

describe('formatPosterName', () => {
  it('joins first and last name', () => {
    expect(formatPosterName({ nameFirst: 'Ada', nameLast: 'Lovelace' })).toBe(
      'Ada Lovelace',
    )
  })

  it('falls back for empty names', () => {
    expect(formatPosterName({ nameFirst: '', nameLast: '' })).toBe(
      'Ladderly Member',
    )
  })
})

describe('parseSalaryInput', () => {
  it('parses digits and strips formatting', () => {
    expect(parseSalaryInput('150,000')).toBe(150000)
    expect(parseSalaryInput('$150000')).toBe(150000)
  })

  it('returns null for empty or non-numeric input', () => {
    expect(parseSalaryInput('')).toBeNull()
    expect(parseSalaryInput('abc')).toBeNull()
  })
})

describe('toJobBoardPostPayload', () => {
  const baseValues: JobBoardPostFormValues = {
    companyName: '  Acme ',
    jobTitle: 'Engineer',
    description: '',
    jobPostUrl: ' https://example.com/job ',
    location: 'NYC',
    isRemote: false,
    baseSalaryMin: '150000',
    baseSalaryMax: '',
    contactType: JobBoardContactType.NETWORK_INTRO,
    introJobFamilies: [IntroJobFamily.ENGINEERING_MANAGER],
  }

  it('trims strings and converts empties to null', () => {
    const payload = toJobBoardPostPayload(baseValues)
    expect(payload.companyName).toBe('Acme')
    expect(payload.description).toBeNull()
    expect(payload.jobPostUrl).toBe('https://example.com/job')
    expect(payload.baseSalaryMin).toBe(150000)
    expect(payload.baseSalaryMax).toBeNull()
    expect(payload.introJobFamilies).toEqual([
      IntroJobFamily.ENGINEERING_MANAGER,
    ])
  })

  it('clears intro job families for direct-contact posts', () => {
    const payload = toJobBoardPostPayload({
      ...baseValues,
      contactType: JobBoardContactType.POSTER,
    })
    expect(payload.introJobFamilies).toEqual([])
  })
})
