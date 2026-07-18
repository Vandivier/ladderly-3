import { IntroJobFamily, JobBoardContactType } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Create a mock database object
const mockDb = {
  user: {
    findUnique: vi.fn(),
  },
  jobBoardPost: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}

// Mock the database module
vi.mock('~/server/db', () => ({
  db: mockDb,
}))

// Import after mocking
import {
  canPostJobs,
  getJobPostExpiryDate,
} from '~/server/api/routers/jobBoard/helpers'
import { jobBoardRouter } from '~/server/api/routers/jobBoard/router'
import {
  JobBoardPostCreateSchema,
  JobBoardPostUpdateSchema,
} from '~/server/api/routers/jobBoard/schemas'

const mockSession = {
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
  },
  expires: new Date().toISOString(),
}

// Create a simple caller for testing (bypasses middleware and input parsing)
const createCaller = (ctx: any): any => {
  const caller: any = {}

  Object.entries(jobBoardRouter).forEach(([key, procedure]: [string, any]) => {
    caller[key] = async (input?: any) => {
      return procedure.query
        ? procedure.query({ ctx, input })
        : procedure.mutation
          ? procedure.mutation({ ctx, input })
          : procedure({ ctx, input })
    }
  })

  return caller
}

const eligibleUser = {
  hasPublicProfileEnabled: true,
  profileLinkedInUri: 'https://linkedin.com/in/test',
  profileContactEmail: null,
}

const validCreateInput = {
  companyName: 'Acme',
  jobTitle: 'Software Engineer',
  description: null,
  jobPostUrl: null,
  location: '',
  isRemote: true,
  baseSalaryMin: null,
  baseSalaryMax: null,
  contactType: JobBoardContactType.POSTER,
  introJobFamilies: [],
}

describe('jobBoard helpers', () => {
  describe('canPostJobs', () => {
    it('allows a public profile with a LinkedIn URL', () => {
      expect(canPostJobs(eligibleUser)).toBe(true)
    })

    it('allows a public profile with a contact email', () => {
      expect(
        canPostJobs({
          hasPublicProfileEnabled: true,
          profileLinkedInUri: null,
          profileContactEmail: 'me@example.com',
        }),
      ).toBe(true)
    })

    it('rejects when the profile is not public', () => {
      expect(
        canPostJobs({ ...eligibleUser, hasPublicProfileEnabled: false }),
      ).toBe(false)
    })

    it('rejects when contact data is missing or whitespace', () => {
      expect(
        canPostJobs({
          hasPublicProfileEnabled: true,
          profileLinkedInUri: null,
          profileContactEmail: null,
        }),
      ).toBe(false)
      expect(
        canPostJobs({
          hasPublicProfileEnabled: true,
          profileLinkedInUri: '   ',
          profileContactEmail: '',
        }),
      ).toBe(false)
    })
  })

  describe('getJobPostExpiryDate', () => {
    it('returns a date one month after the given date', () => {
      const result = getJobPostExpiryDate(new Date('2026-01-15T12:00:00Z'))
      expect(result.toISOString()).toBe('2026-02-15T12:00:00.000Z')
    })

    it('rolls over the year in December', () => {
      const result = getJobPostExpiryDate(new Date('2026-12-15T12:00:00Z'))
      expect(result.toISOString()).toBe('2027-01-15T12:00:00.000Z')
    })
  })
})

describe('jobBoard schemas', () => {
  it('rejects NETWORK_INTRO posts with no intro job families', () => {
    const result = JobBoardPostCreateSchema.safeParse({
      ...validCreateInput,
      contactType: JobBoardContactType.NETWORK_INTRO,
      introJobFamilies: [],
    })

    expect(result.success).toBe(false)
  })

  it('accepts NETWORK_INTRO posts with at least one family', () => {
    const result = JobBoardPostCreateSchema.safeParse({
      ...validCreateInput,
      contactType: JobBoardContactType.NETWORK_INTRO,
      introJobFamilies: [IntroJobFamily.ENGINEERING_MANAGER],
    })

    expect(result.success).toBe(true)
  })

  it('rejects a salary range where min exceeds max', () => {
    const result = JobBoardPostCreateSchema.safeParse({
      ...validCreateInput,
      baseSalaryMin: 200000,
      baseSalaryMax: 150000,
    })

    expect(result.success).toBe(false)
  })

  it('applies the same rules to updates', () => {
    const result = JobBoardPostUpdateSchema.safeParse({
      id: 1,
      contactType: JobBoardContactType.NETWORK_INTRO,
      introJobFamilies: [],
    })

    expect(result.success).toBe(false)
  })
})

describe('jobBoardRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('throws FORBIDDEN when the user is not eligible to post', async () => {
      mockDb.user.findUnique.mockResolvedValue({
        hasPublicProfileEnabled: false,
        profileLinkedInUri: null,
        profileContactEmail: null,
      })

      const caller = createCaller({
        db: mockDb,
        session: mockSession,
        headers: new Headers(),
      })

      await expect(caller.create(validCreateInput)).rejects.toThrow(
        /public profile/i,
      )
      expect(mockDb.jobBoardPost.create).not.toHaveBeenCalled()
    })

    it('creates a post with server-set expiry and author', async () => {
      mockDb.user.findUnique.mockResolvedValue(eligibleUser)
      mockDb.jobBoardPost.create.mockResolvedValue({ id: 5 })

      const caller = createCaller({
        db: mockDb,
        session: mockSession,
        headers: new Headers(),
      })

      const before = getJobPostExpiryDate()
      await caller.create(validCreateInput)
      const after = getJobPostExpiryDate()

      expect(mockDb.jobBoardPost.create).toHaveBeenCalledTimes(1)
      const data = mockDb.jobBoardPost.create.mock.calls[0]![0].data
      expect(data.authorId).toBe(1)
      expect(data.expiresAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(data.expiresAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('coerces introJobFamilies to empty for POSTER posts', async () => {
      mockDb.user.findUnique.mockResolvedValue(eligibleUser)
      mockDb.jobBoardPost.create.mockResolvedValue({ id: 5 })

      const caller = createCaller({
        db: mockDb,
        session: mockSession,
        headers: new Headers(),
      })

      await caller.create({
        ...validCreateInput,
        contactType: JobBoardContactType.POSTER,
        introJobFamilies: [IntroJobFamily.TECHNICAL_RECRUITER],
      })

      expect(mockDb.jobBoardPost.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ introJobFamilies: [] }),
        }),
      )
    })
  })

  describe('getPosts', () => {
    it('filters out expired posts and reports hasMore', async () => {
      const mockPosts = [{ id: 1 }, { id: 2 }, { id: 3 }]
      mockDb.jobBoardPost.findMany.mockResolvedValue(mockPosts)

      const caller = createCaller({
        db: mockDb,
        session: null,
        headers: new Headers(),
      })

      const result = await caller.getPosts({
        skip: 0,
        take: 2,
        sortBy: 'newest',
      })

      expect(result.posts).toHaveLength(2)
      expect(result.hasMore).toBe(true)

      expect(mockDb.jobBoardPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            expiresAt: { gt: expect.any(Date) },
          }),
          orderBy: [{ createdAt: 'desc' }],
          skip: 0,
          take: 3, // take + 1 to check if there are more
        }),
      )
    })

    it('applies minSalary and salaryDesc sort', async () => {
      mockDb.jobBoardPost.findMany.mockResolvedValue([])

      const caller = createCaller({
        db: mockDb,
        session: null,
        headers: new Headers(),
      })

      await caller.getPosts({
        skip: 0,
        take: 10,
        minSalary: 150000,
        sortBy: 'salaryDesc',
      })

      expect(mockDb.jobBoardPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: [
              {
                OR: [
                  { baseSalaryMax: { gte: 150000 } },
                  { baseSalaryMax: null, baseSalaryMin: { gte: 150000 } },
                ],
              },
            ],
          }),
          orderBy: [
            { baseSalaryMax: { sort: 'desc', nulls: 'last' } },
            { baseSalaryMin: { sort: 'desc', nulls: 'last' } },
            { createdAt: 'desc' },
          ],
        }),
      )
    })

    it('searches company name and job title case-insensitively', async () => {
      mockDb.jobBoardPost.findMany.mockResolvedValue([])

      const caller = createCaller({
        db: mockDb,
        session: null,
        headers: new Headers(),
      })

      await caller.getPosts({
        skip: 0,
        take: 10,
        searchTerm: 'acme',
        sortBy: 'newest',
      })

      expect(mockDb.jobBoardPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { companyName: { contains: 'acme', mode: 'insensitive' } },
              { jobTitle: { contains: 'acme', mode: 'insensitive' } },
            ],
          }),
        }),
      )
    })

    it('applies contactType and introJobFamily filters', async () => {
      mockDb.jobBoardPost.findMany.mockResolvedValue([])

      const caller = createCaller({
        db: mockDb,
        session: null,
        headers: new Headers(),
      })

      await caller.getPosts({
        skip: 0,
        take: 10,
        contactType: JobBoardContactType.NETWORK_INTRO,
        introJobFamily: IntroJobFamily.INDIVIDUAL_CONTRIBUTOR,
        sortBy: 'newest',
      })

      expect(mockDb.jobBoardPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            contactType: JobBoardContactType.NETWORK_INTRO,
            introJobFamilies: {
              has: IntroJobFamily.INDIVIDUAL_CONTRIBUTOR,
            },
          }),
        }),
      )
    })
  })

  describe('getMyPosts', () => {
    it('returns all of the current user posts, including expired', async () => {
      const myPosts = [{ id: 1 }, { id: 2 }]
      mockDb.jobBoardPost.findMany.mockResolvedValue(myPosts)

      const caller = createCaller({
        db: mockDb,
        session: mockSession,
        headers: new Headers(),
      })

      const result = await caller.getMyPosts()
      expect(result).toEqual(myPosts)
      expect(mockDb.jobBoardPost.findMany).toHaveBeenCalledWith({
        where: { authorId: 1 },
        orderBy: { createdAt: 'desc' },
      })
    })
  })

  describe('getPost', () => {
    it('returns unexpired posts to anonymous visitors', async () => {
      const livePost = {
        id: 2,
        authorId: 9,
        expiresAt: new Date(Date.now() + 86_400_000),
        author: { id: 9, nameFirst: 'Test', nameLast: 'User' },
      }
      mockDb.jobBoardPost.findUnique.mockResolvedValue(livePost)

      const caller = createCaller({
        db: mockDb,
        session: null,
        headers: new Headers(),
      })

      const result = await caller.getPost({ id: 2 })
      expect(result).toEqual(livePost)
    })

    const expiredPost = {
      id: 1,
      authorId: 1,
      expiresAt: new Date('2020-01-01'),
      author: { id: 1, nameFirst: 'Test', nameLast: 'User' },
    }

    it('hides expired posts from non-authors', async () => {
      mockDb.jobBoardPost.findUnique.mockResolvedValue(expiredPost)

      const caller = createCaller({
        db: mockDb,
        session: null,
        headers: new Headers(),
      })

      await expect(caller.getPost({ id: 1 })).rejects.toThrow(
        'Job post not found',
      )
    })

    it('shows expired posts to their author', async () => {
      mockDb.jobBoardPost.findUnique.mockResolvedValue(expiredPost)

      const caller = createCaller({
        db: mockDb,
        session: mockSession,
        headers: new Headers(),
      })

      const result = await caller.getPost({ id: 1 })
      expect(result.id).toBe(1)
    })

    it('throws NOT_FOUND for missing posts', async () => {
      mockDb.jobBoardPost.findUnique.mockResolvedValue(null)

      const caller = createCaller({
        db: mockDb,
        session: mockSession,
        headers: new Headers(),
      })

      await expect(caller.getPost({ id: 999 })).rejects.toThrow(
        'Job post not found',
      )
    })
  })

  describe('update / renew / delete ownership', () => {
    it('rejects updates from non-owners', async () => {
      mockDb.jobBoardPost.findUnique.mockResolvedValue({
        id: 1,
        authorId: 2,
        contactType: JobBoardContactType.POSTER,
        introJobFamilies: [],
      })

      const caller = createCaller({
        db: mockDb,
        session: mockSession,
        headers: new Headers(),
      })

      await expect(
        caller.update({ id: 1, jobTitle: 'New Title' }),
      ).rejects.toThrow('permission')
      expect(mockDb.jobBoardPost.update).not.toHaveBeenCalled()
    })

    it('clears intro families when switching a post to direct contact', async () => {
      mockDb.jobBoardPost.findUnique.mockResolvedValue({
        id: 1,
        authorId: 1,
        contactType: JobBoardContactType.NETWORK_INTRO,
        introJobFamilies: [IntroJobFamily.ENGINEERING_MANAGER],
      })
      mockDb.jobBoardPost.update.mockResolvedValue({ id: 1 })

      const caller = createCaller({
        db: mockDb,
        session: mockSession,
        headers: new Headers(),
      })

      await caller.update({
        id: 1,
        contactType: JobBoardContactType.POSTER,
        introJobFamilies: [IntroJobFamily.ENGINEERING_MANAGER],
      })

      expect(mockDb.jobBoardPost.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({
            contactType: JobBoardContactType.POSTER,
            introJobFamilies: [],
          }),
        }),
      )
    })

    it('keeps existing families when an update omits them', async () => {
      mockDb.jobBoardPost.findUnique.mockResolvedValue({
        id: 1,
        authorId: 1,
        contactType: JobBoardContactType.NETWORK_INTRO,
        introJobFamilies: [IntroJobFamily.TECHNICAL_RECRUITER],
      })
      mockDb.jobBoardPost.update.mockResolvedValue({ id: 1 })

      const caller = createCaller({
        db: mockDb,
        session: mockSession,
        headers: new Headers(),
      })

      await caller.update({ id: 1, jobTitle: 'Staff Engineer' })

      expect(mockDb.jobBoardPost.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            jobTitle: 'Staff Engineer',
            contactType: JobBoardContactType.NETWORK_INTRO,
            introJobFamilies: [IntroJobFamily.TECHNICAL_RECRUITER],
          }),
        }),
      )
    })

    it('rejects renew from non-owners', async () => {
      mockDb.jobBoardPost.findUnique.mockResolvedValue({
        id: 1,
        authorId: 2,
      })

      const caller = createCaller({
        db: mockDb,
        session: mockSession,
        headers: new Headers(),
      })

      await expect(caller.renew({ id: 1 })).rejects.toThrow('permission')
      expect(mockDb.jobBoardPost.update).not.toHaveBeenCalled()
    })

    it('throws NOT_FOUND when deleting a missing post', async () => {
      mockDb.jobBoardPost.findUnique.mockResolvedValue(null)

      const caller = createCaller({
        db: mockDb,
        session: mockSession,
        headers: new Headers(),
      })

      await expect(caller.delete({ id: 999 })).rejects.toThrow(
        'Job post not found',
      )
      expect(mockDb.jobBoardPost.delete).not.toHaveBeenCalled()
    })

    it('deletes an owned post', async () => {
      mockDb.jobBoardPost.findUnique.mockResolvedValue({
        id: 1,
        authorId: 1,
      })
      mockDb.jobBoardPost.delete.mockResolvedValue({})

      const caller = createCaller({
        db: mockDb,
        session: mockSession,
        headers: new Headers(),
      })

      const result = await caller.delete({ id: 1 })
      expect(result).toEqual({ success: true })
      expect(mockDb.jobBoardPost.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      })
    })

    it('renew resets expiresAt for the owner', async () => {
      mockDb.jobBoardPost.findUnique.mockResolvedValue({
        id: 1,
        authorId: 1,
      })
      mockDb.jobBoardPost.update.mockResolvedValue({ id: 1 })

      const caller = createCaller({
        db: mockDb,
        session: mockSession,
        headers: new Headers(),
      })

      await caller.renew({ id: 1 })
      expect(mockDb.jobBoardPost.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: { expiresAt: expect.any(Date) },
        }),
      )
    })
  })
})
