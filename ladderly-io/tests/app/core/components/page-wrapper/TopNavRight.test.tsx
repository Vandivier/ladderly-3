import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import React from 'react'
import {
  TopNavRight,
  TopNavRightSkeleton,
} from '~/app/core/components/page-wrapper/TopNavRight'
import {
  MenuProvider,
  MenuContext,
} from '~/app/core/components/page-wrapper/MenuProvider'

// Mock next-auth/react
const mockUseSession = vi.fn()
vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}))

// Mock tRPC
const mockUseQuery = vi.fn()
const mockRefetch = vi.fn()
vi.mock('~/trpc/react', () => ({
  api: {
    user: {
      getCurrentUser: {
        useQuery: (...args: unknown[]) => mockUseQuery(...args),
      },
    },
  },
}))

// Mock next/navigation
const mockPush = vi.fn()
const mockReplace = vi.fn()
const mockSearchParamsGet = vi.fn()

vi.mock('next/navigation', async (importOriginal) => {
  const original = (await importOriginal()) as Record<string, unknown>
  return {
    ...original,
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
      prefetch: vi.fn(),
    }),
    useSearchParams: () => {
      // Create a URLSearchParams object and populate it based on mock
      const params = new URLSearchParams()
      // Call the mock to get the value and populate params
      const refreshValue = mockSearchParamsGet('refresh_current_user')
      if (refreshValue !== null && refreshValue !== undefined) {
        params.set('refresh_current_user', String(refreshValue))
      }
      return params
    },
  }
})

// Mock submenu components
vi.mock('~/app/core/components/page-wrapper/TopNavSubmenu', () => ({
  AccountMenuItems: ({ userId }: { userId: string }) => (
    <div data-testid="account-menu-items">Account Menu for {userId}</div>
  ),
  CommunityMenuItems: () => (
    <div data-testid="community-menu-items">Community Menu</div>
  ),
  GrowMenuItems: () => <div data-testid="grow-menu-items">Grow Menu</div>,
  TOP_NAV_STANDARD_CLASSES: 'test-nav-classes',
}))

// Mock IconVerticalChevron
vi.mock('~/app/core/components/icons/VerticalChevron', () => ({
  IconVerticalChevron: ({ isPointingUp }: { isPointingUp: boolean }) => (
    <span data-testid="chevron">{isPointingUp ? '↑' : '↓'}</span>
  ),
}))

describe('TopNavRight', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseQuery.mockReturnValue({
      data: null,
      refetch: mockRefetch,
    })
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })
    mockSearchParamsGet.mockReturnValue(null)
    mockRefetch.mockResolvedValue({ data: null })
  })

  describe('rendering', () => {
    it('renders all navigation links', () => {
      render(
        <MenuProvider>
          <TopNavRight />
        </MenuProvider>,
      )

      expect(screen.getByText('Perks')).toBeInTheDocument()
      expect(screen.getByText('FAQ')).toBeInTheDocument()
      expect(screen.getByText('Grow')).toBeInTheDocument()
      expect(screen.getByText('Community')).toBeInTheDocument()
    })

    it('renders Log In and Create Account links for unauthenticated users', () => {
      render(
        <MenuProvider>
          <TopNavRight />
        </MenuProvider>,
      )

      expect(screen.getByText('Log In')).toBeInTheDocument()
      expect(screen.getByText('Create Account')).toBeInTheDocument()
      expect(screen.queryByText('Account')).not.toBeInTheDocument()
    })

    it('renders Account button when user is authenticated via session', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '123',
            email: 'test@example.com',
          },
        },
        status: 'authenticated',
      })

      render(
        <MenuProvider>
          <TopNavRight />
        </MenuProvider>,
      )

      expect(screen.getByText('Account')).toBeInTheDocument()
      expect(screen.queryByText('Log In')).not.toBeInTheDocument()
      expect(screen.queryByText('Create Account')).not.toBeInTheDocument()
    })

    it('renders Account button when currentUser query returns data', () => {
      mockUseQuery.mockReturnValue({
        data: {
          id: 456,
          email: 'user@example.com',
        },
        refetch: mockRefetch,
      })
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      })

      render(
        <MenuProvider>
          <TopNavRight />
        </MenuProvider>,
      )

      expect(screen.getByText('Account')).toBeInTheDocument()
      expect(screen.queryByText('Log In')).not.toBeInTheDocument()
    })

    it('renders Account button when both session and currentUser are available', () => {
      mockUseQuery.mockReturnValue({
        data: {
          id: 456,
          email: 'user@example.com',
        },
        refetch: mockRefetch,
      })
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '123',
            email: 'test@example.com',
          },
        },
        status: 'authenticated',
      })

      render(
        <MenuProvider>
          <TopNavRight />
        </MenuProvider>,
      )

      expect(screen.getByText('Account')).toBeInTheDocument()
    })
  })

  describe('menu interactions', () => {
    // Helper component to render menu content area
    const MenuContentRenderer = () => {
      const { menuContent } = React.useContext(MenuContext)
      return menuContent ? (
        <div data-testid="menu-content-area">{menuContent}</div>
      ) : null
    }

    it('opens Grow menu when Grow button is clicked', () => {
      render(
        <MenuProvider>
          <TopNavRight />
          <MenuContentRenderer />
        </MenuProvider>,
      )

      const growButton = screen.getByText('Grow')
      fireEvent.click(growButton)

      expect(screen.getByTestId('grow-menu-items')).toBeInTheDocument()
    })

    it('closes Grow menu when Grow button is clicked again', () => {
      render(
        <MenuProvider>
          <TopNavRight />
          <MenuContentRenderer />
        </MenuProvider>,
      )

      const growButton = screen.getByText('Grow')
      fireEvent.click(growButton)
      expect(screen.getByTestId('grow-menu-items')).toBeInTheDocument()

      fireEvent.click(growButton)
      expect(screen.queryByTestId('grow-menu-items')).not.toBeInTheDocument()
    })

    it('opens Community menu when Community button is clicked', () => {
      render(
        <MenuProvider>
          <TopNavRight />
          <MenuContentRenderer />
        </MenuProvider>,
      )

      const communityButton = screen.getByText('Community')
      fireEvent.click(communityButton)

      expect(screen.getByTestId('community-menu-items')).toBeInTheDocument()
    })

    it('opens Account menu when Account button is clicked with currentUser', () => {
      mockUseQuery.mockReturnValue({
        data: {
          id: 456,
          email: 'user@example.com',
        },
        refetch: mockRefetch,
      })
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '123',
            email: 'test@example.com',
          },
        },
        status: 'authenticated',
      })

      render(
        <MenuProvider>
          <TopNavRight />
          <MenuContentRenderer />
        </MenuProvider>,
      )

      const accountButton = screen.getByText('Account')
      fireEvent.click(accountButton)

      expect(screen.getByTestId('account-menu-items')).toBeInTheDocument()
      expect(screen.getByText('Account Menu for 456')).toBeInTheDocument()
    })

    it('opens Account menu using session user ID when currentUser is not available', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        refetch: mockRefetch,
      })
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '789',
            email: 'session@example.com',
          },
        },
        status: 'authenticated',
      })

      render(
        <MenuProvider>
          <TopNavRight />
          <MenuContentRenderer />
        </MenuProvider>,
      )

      const accountButton = screen.getByText('Account')
      fireEvent.click(accountButton)

      expect(screen.getByTestId('account-menu-items')).toBeInTheDocument()
      expect(screen.getByText('Account Menu for 789')).toBeInTheDocument()
    })

    it('closes Account menu when Account button is clicked again', () => {
      mockUseQuery.mockReturnValue({
        data: {
          id: 456,
          email: 'user@example.com',
        },
        refetch: mockRefetch,
      })
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '123',
            email: 'test@example.com',
          },
        },
        status: 'authenticated',
      })

      render(
        <MenuProvider>
          <TopNavRight />
          <MenuContentRenderer />
        </MenuProvider>,
      )

      const accountButton = screen.getByText('Account')
      fireEvent.click(accountButton)
      expect(screen.getByTestId('account-menu-items')).toBeInTheDocument()

      fireEvent.click(accountButton)
      expect(screen.queryByTestId('account-menu-items')).not.toBeInTheDocument()
    })
  })

  describe('chevron icons', () => {
    it('shows chevron pointing up when Grow menu is open', () => {
      render(
        <MenuProvider>
          <TopNavRight />
        </MenuProvider>,
      )

      const growButton = screen.getByText('Grow')
      fireEvent.click(growButton)

      const chevrons = screen.getAllByTestId('chevron')
      const growChevron = chevrons.find((chevron) =>
        growButton.contains(chevron),
      )
      expect(growChevron).toHaveTextContent('↑')
    })

    it('shows chevron pointing down when Account menu is closed', () => {
      mockUseQuery.mockReturnValue({
        data: {
          id: 456,
          email: 'user@example.com',
        },
        refetch: mockRefetch,
      })
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '123',
            email: 'test@example.com',
          },
        },
        status: 'authenticated',
      })

      render(
        <MenuProvider>
          <TopNavRight />
        </MenuProvider>,
      )

      const accountButton = screen.getByText('Account')
      const chevrons = screen.getAllByTestId('chevron')
      const accountChevron = chevrons.find((chevron) =>
        accountButton.contains(chevron),
      )
      expect(accountChevron).toHaveTextContent('↓')
    })
  })

  describe('session transition handling', () => {
    it('refetches currentUser when session transitions from unauthenticated to authenticated', async () => {
      const { rerender } = render(
        <MenuProvider>
          <TopNavRight />
        </MenuProvider>,
      )

      // Initially unauthenticated
      expect(mockRefetch).not.toHaveBeenCalled()

      // Transition to authenticated
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '123',
            email: 'test@example.com',
          },
        },
        status: 'authenticated',
      })

      rerender(
        <MenuProvider>
          <TopNavRight />
        </MenuProvider>,
      )

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalledTimes(1)
      })
    })

    it('does not refetch when session status does not change', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '123',
            email: 'test@example.com',
          },
        },
        status: 'authenticated',
      })

      const { rerender } = render(
        <MenuProvider>
          <TopNavRight />
        </MenuProvider>,
      )

      mockRefetch.mockClear()

      // Re-render with same status
      rerender(
        <MenuProvider>
          <TopNavRight />
        </MenuProvider>,
      )

      expect(mockRefetch).not.toHaveBeenCalled()
    })
  })

  describe('refresh_current_user query parameter', () => {
    let originalLocation: Location

    beforeEach(() => {
      // Save original location
      originalLocation = window.location
      // Mock window.location.href
      delete (window as { location?: Location }).location
      window.location = {
        ...originalLocation,
        href: '',
      } as Location
    })

    afterEach(() => {
      // Restore original location
      window.location = originalLocation
    })

    it('refreshes page and removes query parameter when refresh_current_user is true', async () => {
      mockSearchParamsGet.mockImplementation((key: string) => {
        if (key === 'refresh_current_user') return 'true'
        return null
      })

      render(
        <MenuProvider>
          <TopNavRight />
        </MenuProvider>,
      )

      await waitFor(() => {
        expect(window.location.href).toBe('/')
      })
    })

    it('does not refresh when refresh_current_user is not present', () => {
      mockSearchParamsGet.mockReturnValue(null)

      render(
        <MenuProvider>
          <TopNavRight />
        </MenuProvider>,
      )

      expect(window.location.href).toBe('')
    })
  })

  describe('query options', () => {
    it('passes correct options to useQuery', () => {
      render(
        <MenuProvider>
          <TopNavRight />
        </MenuProvider>,
      )

      expect(mockUseQuery).toHaveBeenCalledWith(undefined, {
        refetchOnMount: true,
        refetchOnWindowFocus: true,
      })
    })
  })
})

describe('TopNavRightSkeleton', () => {
  it('renders skeleton navigation links', () => {
    render(<TopNavRightSkeleton />)

    expect(screen.getByText('Perks')).toBeInTheDocument()
    expect(screen.getByText('Blog')).toBeInTheDocument()
  })

  it('does not render interactive elements', () => {
    render(<TopNavRightSkeleton />)

    expect(screen.queryByText('Grow')).not.toBeInTheDocument()
    expect(screen.queryByText('Community')).not.toBeInTheDocument()
    expect(screen.queryByText('Account')).not.toBeInTheDocument()
    expect(screen.queryByText('Log In')).not.toBeInTheDocument()
  })
})
