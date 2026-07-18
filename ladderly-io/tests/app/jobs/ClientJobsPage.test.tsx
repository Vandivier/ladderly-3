import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { ClientJobsPage } from '~/app/jobs/ClientJobsPage'

// Mock the useRouter hook
const mockPush = vi.fn()
let searchParamValues: Record<string, string | null> = {}
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (param: string) => searchParamValues[param] ?? null,
    toString: () => '',
  }),
}))

// Create a mock for the tRPC API
const mockUseQueryFn = vi.fn()
vi.mock('~/trpc/react', () => {
  return {
    api: {
      jobBoard: {
        getPosts: {
          useQuery: (...args: unknown[]) => mockUseQueryFn(...args),
        },
      },
    },
  }
})

const mockPosts = [
  {
    id: 1,
    jobTitle: 'Software Engineer',
    companyName: 'Acme',
    location: 'NYC',
    isRemote: true,
    baseSalaryMin: 150000,
    baseSalaryMax: 180000,
    contactType: 'POSTER',
    introJobFamilies: [],
    createdAt: new Date('2026-07-01'),
    author: { id: 10, nameFirst: 'Ada', nameLast: 'Lovelace' },
  },
  {
    id: 2,
    jobTitle: 'Platform Engineer',
    companyName: 'Globex',
    location: '',
    isRemote: false,
    baseSalaryMin: null,
    baseSalaryMax: null,
    contactType: 'NETWORK_INTRO',
    introJobFamilies: ['ENGINEERING_MANAGER'],
    createdAt: new Date('2026-07-02'),
    author: { id: 11, nameFirst: '', nameLast: '' },
  },
]

describe('ClientJobsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    searchParamValues = {}

    mockUseQueryFn.mockReturnValue({
      data: { posts: mockPosts, hasMore: false },
      isLoading: false,
    })
  })

  test('renders job posts with salary, badges, and poster links', () => {
    render(<ClientJobsPage />)

    expect(
      screen.getByText('Software Engineer at Acme'),
    ).toBeInTheDocument()
    expect(screen.getByText('$150k–$180k')).toBeInTheDocument()
    expect(screen.getByText('Remote')).toBeInTheDocument()
    // appears as both the filter chip and the badge on the first post
    expect(screen.getAllByText('Direct Contact')).toHaveLength(2)
    expect(
      screen.getByText('Intro Available: Engineering Manager'),
    ).toBeInTheDocument()

    const posterLink = screen.getByRole('link', { name: 'Ada Lovelace' })
    expect(posterLink).toHaveAttribute('href', '/community/10')
    // fallback name for empty poster names
    expect(
      screen.getByRole('link', { name: 'Ladderly Member' }),
    ).toHaveAttribute('href', '/community/11')

    expect(
      screen.getByRole('link', { name: 'Software Engineer at Acme' }),
    ).toHaveAttribute('href', '/jobs/1')
  })

  test('queries with default filters', () => {
    render(<ClientJobsPage />)

    expect(mockUseQueryFn).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      searchTerm: undefined,
      contactType: undefined,
      introJobFamily: undefined,
      minSalary: undefined,
      sortBy: 'newest',
    })
  })

  test('reads filters from search params', () => {
    searchParamValues = {
      page: '2',
      q: 'engineer',
      contactType: 'NETWORK_INTRO',
      family: 'TECHNICAL_RECRUITER',
      minSalary: '150000',
      sort: 'salaryDesc',
    }

    render(<ClientJobsPage />)

    expect(mockUseQueryFn).toHaveBeenCalledWith({
      skip: 20,
      take: 10,
      searchTerm: 'engineer',
      contactType: 'NETWORK_INTRO',
      introJobFamily: 'TECHNICAL_RECRUITER',
      minSalary: 150000,
      sortBy: 'salaryDesc',
    })
  })

  test('ignores invalid filter params', () => {
    searchParamValues = {
      page: 'nope',
      contactType: 'HACKER',
      family: 'CEO',
      minSalary: '-5',
    }

    render(<ClientJobsPage />)

    expect(mockUseQueryFn).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        contactType: undefined,
        introJobFamily: undefined,
        minSalary: undefined,
      }),
    )
  })

  test('applies contact filter chips via the URL', () => {
    render(<ClientJobsPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Intro Available' }))

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('contactType=NETWORK_INTRO'),
    )
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('page=0'))
  })

  test('applies search and min salary via the URL', () => {
    render(<ClientJobsPage />)

    fireEvent.change(
      screen.getByPlaceholderText('Search by title or company'),
      { target: { value: 'staff engineer' } },
    )
    fireEvent.change(screen.getByPlaceholderText('Min salary'), {
      target: { value: '175,000' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('q=staff+engineer'),
    )
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('minSalary=175000'),
    )
  })

  test('toggles the salary sort', () => {
    render(<ClientJobsPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Highest Salary' }))

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('sort=salaryDesc'),
    )
  })

  test('shows pagination buttons correctly', () => {
    mockUseQueryFn.mockReturnValue({
      data: { posts: mockPosts, hasMore: true },
      isLoading: false,
    })

    render(<ClientJobsPage />)

    expect(screen.getByText('Next')).toBeInTheDocument()
    expect(screen.queryByText('Previous')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Next'))
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('page=1'))
  })

  test('shows previous button beyond the first page', () => {
    searchParamValues = { page: '1' }

    render(<ClientJobsPage />)

    expect(screen.getByText('Previous')).toBeInTheDocument()
  })

  test('shows loading state', () => {
    mockUseQueryFn.mockReturnValue({ isLoading: true })

    render(<ClientJobsPage />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  test('shows empty state with a post-a-job prompt', () => {
    mockUseQueryFn.mockReturnValue({
      data: { posts: [], hasMore: false },
      isLoading: false,
    })

    render(<ClientJobsPage />)

    expect(screen.getByText(/No jobs found/)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Post the first one!' }),
    ).toHaveAttribute('href', '/jobs/post')
  })
})
