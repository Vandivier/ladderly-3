import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, test, vi, beforeEach } from 'vitest'
import ClientCommunityPage from '~/app/community/ClientCommunityPage'

// Mock the useRouter hook
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (param: string) => {
      switch (param) {
        case 'page':
          return '0'
        case 'q':
          return ''
        case 'openToWork':
          return null
        case 'hasContact':
          return null
        case 'hasNetworking':
          return null
        case 'hasServices':
          return null
        default:
          return null
      }
    },
    toString: () => '',
  }),
}))

// Mock the CommunityMemberListItem component
vi.mock('~/app/community/CommunityMemberListItem', () => ({
  CommunityMemberListItem: ({ user }) => (
    <li data-testid={`user-${user.id}`}>
      <div>{user.name}</div>
      <div>{user.profileCurrentJobTitle}</div>
    </li>
  ),
}))

// Create a mock for the tRPC API
const mockUseQueryFn = vi.fn()
vi.mock('~/trpc/react', () => {
  return {
    api: {
      user: {
        getPaginatedUsers: {
          useQuery: (...args) => mockUseQueryFn(...args),
        },
      },
    },
  }
})

describe('ClientCommunityPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()

    // Default mock implementation
    mockUseQueryFn.mockReturnValue({
      data: {
        users: [
          {
            id: 1,
            name: 'Test User 1',
            profilePicture: null,
            profileCurrentJobTitle: 'Software Engineer',
            profileCurrentJobCompany: 'Tech Co',
            hasOpenToWork: true,
            profileContactEmail: 'test1@example.com',
            profileTopNetworkingReasons: ['Mentorship', 'Job opportunities'],
            profileTopServices: ['Consulting', 'Coaching'],
            hasPublicProfileEnabled: true,
          },
          {
            id: 2,
            name: 'Test User 2',
            profilePicture: null,
            profileCurrentJobTitle: 'Product Manager',
            profileCurrentJobCompany: 'Product Co',
            hasOpenToWork: false,
            profileContactEmail: null,
            profileTopNetworkingReasons: [],
            profileTopServices: [],
            hasPublicProfileEnabled: true,
          },
        ],
        hasMore: false,
      },
      isLoading: false,
    })
  })

  test('renders the community page with users', () => {
    render(<ClientCommunityPage />)

    // Check if users are rendered
    expect(screen.getByTestId('user-1')).toBeInTheDocument()
    expect(screen.getByTestId('user-2')).toBeInTheDocument()

    // Check if filter chips are rendered
    expect(screen.getByText('Open to Work')).toBeInTheDocument()
    expect(screen.getByText('Has Contact Info')).toBeInTheDocument()
    expect(screen.getByText('Has Networking Interests')).toBeInTheDocument()
    expect(screen.getByText('Offers Services')).toBeInTheDocument()
  })

  test('applies filters when clicked', () => {
    render(<ClientCommunityPage />)

    // Click on the "Open to Work" filter
    fireEvent.click(screen.getByText('Open to Work'))

    // Verify router.push was called with the correct query params
    expect(mockPush).toHaveBeenCalledWith('?page=0&openToWork=true')
  })

  test('shows pagination buttons correctly', () => {
    // Mock a case with more pages
    mockUseQueryFn.mockReturnValue({
      data: {
        users: [{ id: 1, name: 'Test User 1' }],
        hasMore: true,
      },
      isLoading: false,
    })

    render(<ClientCommunityPage />)

    // Next button should be visible
    expect(screen.getByText('Next')).toBeInTheDocument()

    // Previous button should not be visible on first page
    expect(screen.queryByText('Previous')).not.toBeInTheDocument()
  })

  test('shows loading state', () => {
    // Mock loading state
    mockUseQueryFn.mockReturnValue({
      isLoading: true,
    })

    render(<ClientCommunityPage />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  test('shows empty state when no users match filters', () => {
    // Mock empty results
    mockUseQueryFn.mockReturnValue({
      data: {
        users: [],
        hasMore: false,
      },
      isLoading: false,
    })

    render(<ClientCommunityPage />)

    expect(screen.getByText('No Results Found.')).toBeInTheDocument()
  })
})
