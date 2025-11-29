import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import React, { useEffect } from 'react'
import { authClient, useSession } from '~/server/auth-client'
import { api } from '~/trpc/react'
import { IconVerticalChevron } from '../icons/VerticalChevron'
import { MenuContext } from './MenuProvider'
import {
  AccountMenuItems,
  CommunityMenuItems,
  GrowMenuItems,
  TOP_NAV_STANDARD_CLASSES,
} from './TopNavSubmenu'

const TOP_NAV_RIGHT_SECTION_CLASSES = 'ml-auto flex items-center space-x-6'

export const TopNavRight = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, isPending: isSessionPending } = useSession()
  const currentUserQuery = api.user.getCurrentUser.useQuery(undefined, {
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })
  const currentUser = currentUserQuery.data
  const { setMenu, openMenuName } = React.useContext(MenuContext)

  // Track previous session status to detect transitions
  const prevIsAuthenticatedRef = React.useRef(!!session?.user)
  const { refetch: refetchCurrentUser } = currentUserQuery

  const isAuthenticated = !!session?.user

  // Refetch when session changes from unauthenticated to authenticated
  useEffect(() => {
    const prevIsAuthenticated = prevIsAuthenticatedRef.current
    prevIsAuthenticatedRef.current = isAuthenticated

    if (!prevIsAuthenticated && isAuthenticated) {
      // Session just became authenticated, refetch user data
      void refetchCurrentUser()
    }
  }, [isAuthenticated, refetchCurrentUser])

  // currentUser can be 0 (NULL_RESULT_TRPC_INT), so check if it's not 0
  let showAccountButton = false
  if (currentUser !== 0 && currentUser) {
    showAccountButton = true
  } else if (isAuthenticated) {
    showAccountButton = true
  }

  useEffect(() => {
    const params = searchParams ?? new URLSearchParams()
    const refreshCurrentUser = params.get('refresh_current_user')

    if (refreshCurrentUser === 'true') {
      // Remove the query parameter and refresh the page to ensure all state is updated
      const newQuery = new URLSearchParams(params)
      newQuery.delete('refresh_current_user')
      const newUrl = newQuery.toString() ? `?${newQuery.toString()}` : '/'

      // Refresh the page to ensure all server-side state is updated
      window.location.href = newUrl
    }
  }, [searchParams, router])

  const handleAccountClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (openMenuName === 'account') {
      setMenu?.(null, '')
    } else if (currentUser) {
      setMenu?.(
        <AccountMenuItems userId={currentUser.id.toString()} />,
        'account',
      )
    } else if (session?.user?.id) {
      // Fallback to session user ID if currentUser query hasn't loaded yet
      setMenu?.(<AccountMenuItems userId={session.user.id} />, 'account')
    }
  }

  const handleCommunityClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (openMenuName === 'community') {
      setMenu?.(null, '')
    } else {
      setMenu?.(<CommunityMenuItems />, 'community')
    }
  }

  const handleGrowClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (openMenuName === 'grow') {
      setMenu?.(null, '')
    } else {
      setMenu?.(<GrowMenuItems />, 'grow')
    }
  }

  return (
    <div className={TOP_NAV_RIGHT_SECTION_CLASSES}>
      <Link href="/perks" className={TOP_NAV_STANDARD_CLASSES}>
        Perks
      </Link>
      <Link href="/blog/2025-05-03-faq" className={TOP_NAV_STANDARD_CLASSES}>
        FAQ
      </Link>
      <button onClick={handleGrowClick} className={TOP_NAV_STANDARD_CLASSES}>
        Grow
        <IconVerticalChevron isPointingUp={openMenuName === 'grow'} />
      </button>
      <button
        onClick={handleCommunityClick}
        className={TOP_NAV_STANDARD_CLASSES}
      >
        Community
        <IconVerticalChevron isPointingUp={openMenuName === 'community'} />
      </button>
      {showAccountButton ? (
        <button
          onClick={handleAccountClick}
          className={TOP_NAV_STANDARD_CLASSES}
        >
          Account
          <IconVerticalChevron isPointingUp={openMenuName === 'account'} />
        </button>
      ) : (
        <>
          <Link className={TOP_NAV_STANDARD_CLASSES} href="/login">
            Log In
          </Link>
          <Link className={TOP_NAV_STANDARD_CLASSES} href="/signup">
            Create Account
          </Link>
        </>
      )}
    </div>
  )
}

export const TopNavRightSkeleton = () => (
  <div className={TOP_NAV_RIGHT_SECTION_CLASSES}>
    <Link href="/perks" className={TOP_NAV_STANDARD_CLASSES}>
      Perks
    </Link>
    <Link href="/blog" className={TOP_NAV_STANDARD_CLASSES}>
      Blog
    </Link>
  </div>
)
