import { render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const { mockGetSession, mockGetSettings, mockGetPost, mockGetMyPosts } =
  vi.hoisted(() => ({
    mockGetSession: vi.fn(),
    mockGetSettings: vi.fn(),
    mockGetPost: vi.fn(),
    mockGetMyPosts: vi.fn(),
  }))

vi.mock('next/headers', () => ({
  headers: () => new Headers(),
}))

vi.mock('~/server/better-auth', () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
  },
}))

vi.mock('~/trpc/server', () => ({
  api: {
    user: {
      getSettings: mockGetSettings,
    },
    jobBoard: {
      getPost: mockGetPost,
      getMyPosts: mockGetMyPosts,
    },
  },
}))

vi.mock('~/app/jobs/components/JobBoardPostForm', () => ({
  JobBoardPostForm: (props: { postId?: number; initialValues?: unknown }) =>
    React.createElement('div', {
      'data-testid': 'job-board-post-form',
      'data-post-id': props.postId ?? '',
    }),
}))

vi.mock('~/app/jobs/components/JobPostOwnerActions', () => ({
  JobPostOwnerActions: (props: { postId: number; isExpired: boolean }) =>
    React.createElement(
      'div',
      { 'data-testid': 'owner-actions' },
      props.isExpired ? 'owner-actions-expired' : 'owner-actions-live',
    ),
}))

import { JobPostDetail } from '~/app/jobs/[id]/JobPostDetail'
import { EditJobPostContent } from '~/app/jobs/[id]/edit/EditJobPostContent'
import { MyJobPostsList } from '~/app/jobs/mine/MyJobPostsList'
import { PostJobContent } from '~/app/jobs/post/PostJobContent'

const futureDate = new Date(Date.now() + 7 * 86_400_000)
const pastDate = new Date('2020-01-01')

const livePost = {
  id: 3,
  jobTitle: 'Software Engineer',
  companyName: 'Acme',
  description: 'Build things.',
  jobPostUrl: 'https://example.com/job',
  location: 'NYC',
  isRemote: true,
  baseSalaryMin: 150000,
  baseSalaryMax: 180000,
  contactType: 'POSTER',
  introJobFamilies: [],
  createdAt: new Date('2026-07-01'),
  expiresAt: futureDate,
  author: { id: 10, nameFirst: 'Ada', nameLast: 'Lovelace' },
}

describe('PostJobContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('prompts signed-out visitors to log in', async () => {
    mockGetSession.mockResolvedValue(null)

    render(await PostJobContent())

    expect(screen.getByRole('link', { name: 'log in' })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(
      screen.queryByTestId('job-board-post-form'),
    ).not.toBeInTheDocument()
    expect(mockGetSettings).not.toHaveBeenCalled()
  })

  test('explains requirements to ineligible members', async () => {
    mockGetSession.mockResolvedValue({ user: { id: '1' } })
    mockGetSettings.mockResolvedValue({
      hasPublicProfileEnabled: false,
      profileLinkedInUri: null,
      profileContactEmail: null,
    })

    render(await PostJobContent())

    expect(screen.getByText('A public profile')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Settings Page' })).toHaveAttribute(
      'href',
      '/settings',
    )
    expect(
      screen.queryByTestId('job-board-post-form'),
    ).not.toBeInTheDocument()
  })

  test('treats settings errors (e.g. unverified email) as ineligible', async () => {
    mockGetSession.mockResolvedValue({ user: { id: '1' } })
    mockGetSettings.mockRejectedValue(new Error('FORBIDDEN'))

    render(await PostJobContent())

    expect(screen.getByText('A verified email')).toBeInTheDocument()
    expect(
      screen.queryByTestId('job-board-post-form'),
    ).not.toBeInTheDocument()
  })

  test('renders the form for eligible members', async () => {
    mockGetSession.mockResolvedValue({ user: { id: '1' } })
    mockGetSettings.mockResolvedValue({
      hasPublicProfileEnabled: true,
      profileLinkedInUri: 'https://linkedin.com/in/test',
      profileContactEmail: null,
    })

    render(await PostJobContent())

    expect(screen.getByTestId('job-board-post-form')).toBeInTheDocument()
  })
})

describe('JobPostDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('shows a fallback when the post is missing or expired', async () => {
    mockGetSession.mockResolvedValue(null)
    mockGetPost.mockRejectedValue(new Error('Job post not found'))

    render(await JobPostDetail({ postId: 999 }))

    expect(
      screen.getByText('This job post does not exist or has expired.'),
    ).toBeInTheDocument()
  })

  test('renders post details with a link to the poster profile', async () => {
    mockGetSession.mockResolvedValue(null)
    mockGetPost.mockResolvedValue(livePost)

    render(await JobPostDetail({ postId: 3 }))

    expect(
      screen.getByText('Software Engineer at Acme'),
    ).toBeInTheDocument()
    expect(screen.getByText('$150k–$180k')).toBeInTheDocument()
    expect(
      screen.getByText('The poster is the direct contact for this job.', {
        exact: false,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Ada Lovelace's Profile/ }),
    ).toHaveAttribute('href', '/community/10')
    // visitors don't see owner actions
    expect(screen.queryByTestId('owner-actions')).not.toBeInTheDocument()
  })

  test('shows owner actions and expired badge to the author', async () => {
    mockGetSession.mockResolvedValue({ user: { id: '10' } })
    mockGetPost.mockResolvedValue({ ...livePost, expiresAt: pastDate })

    render(await JobPostDetail({ postId: 3 }))

    expect(screen.getByText('owner-actions-expired')).toBeInTheDocument()
    expect(screen.getAllByText('Expired').length).toBeGreaterThan(0)
  })
})

describe('EditJobPostContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('blocks non-owners', async () => {
    mockGetSession.mockResolvedValue({ user: { id: '2' } })
    mockGetPost.mockResolvedValue(livePost)

    render(await EditJobPostContent({ postId: 3 }))

    expect(
      screen.getByText(/do not have permission to edit/),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('job-board-post-form'),
    ).not.toBeInTheDocument()
  })

  test('renders the form for the owner', async () => {
    mockGetSession.mockResolvedValue({ user: { id: '10' } })
    mockGetPost.mockResolvedValue(livePost)

    render(await EditJobPostContent({ postId: 3 }))

    const form = screen.getByTestId('job-board-post-form')
    expect(form).toHaveAttribute('data-post-id', '3')
  })
})

describe('MyJobPostsList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('shows an empty state with a posting prompt', async () => {
    mockGetMyPosts.mockResolvedValue([])

    render(await MyJobPostsList())

    expect(
      screen.getByRole('link', { name: 'Post your first job!' }),
    ).toHaveAttribute('href', '/jobs/post')
  })

  test('marks expired posts and renders owner actions', async () => {
    mockGetMyPosts.mockResolvedValue([
      livePost,
      { ...livePost, id: 4, expiresAt: pastDate },
    ])

    render(await MyJobPostsList())

    expect(screen.getByText('owner-actions-live')).toBeInTheDocument()
    expect(screen.getByText('owner-actions-expired')).toBeInTheDocument()
    expect(screen.getAllByText('Expired').length).toBeGreaterThan(0)
  })
})
