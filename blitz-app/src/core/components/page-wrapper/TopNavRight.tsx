import Link from 'next/link'
import React from 'react'
import { useCurrentUser } from 'src/app/users/hooks/useCurrentUser'
import { IconVerticalChevron } from '../icons/VerticalChevron'
import { MenuContext } from './MenuProvider'
import {
  AccountMenuItems,
  CommunityMenuItems,
  TOP_NAV_STANDARD_CLASSES,
  TopHonorsMenuItems,
} from './TopNavSubmenu'

const TOP_NAV_RIGHT_SECTION_CLASSES = 'ml-auto flex items-center space-x-6'

export const TopNavRight = () => {
  const currentUser = useCurrentUser()
  const { setMenu, openMenuName } = React.useContext(MenuContext)

  const handleCommunityClick = (e) => {
    e.preventDefault()
    if (openMenuName === 'community') {
      setMenu(null, '')
    } else {
      setMenu(<CommunityMenuItems />, 'community')
    }
  }

  const handleAccountClick = (e) => {
    e.preventDefault()
    if (openMenuName === 'account') {
      setMenu(null, '')
    } else if (currentUser) {
      setMenu(<AccountMenuItems currentUser={currentUser} />, 'account')
    }
  }

  const handleLeaderboardClick = (e) => {
    e.preventDefault()
    if (openMenuName === 'leaderboard') {
      setMenu(null, '')
    } else {
      setMenu(<TopHonorsMenuItems />, 'leaderboard')
    }
  }

  return (
    <div className={TOP_NAV_RIGHT_SECTION_CLASSES}>
      <button
        onClick={handleLeaderboardClick}
        className={TOP_NAV_STANDARD_CLASSES}
      >
        Top Honors Leaderboard
        <IconVerticalChevron isPointingUp={openMenuName === 'leaderboard'} />
      </button>
      <Link href="/perks" className={TOP_NAV_STANDARD_CLASSES}>
        Perks
      </Link>
      <Link href="/blog" className={TOP_NAV_STANDARD_CLASSES}>
        Blog
      </Link>
      <button
        onClick={handleCommunityClick}
        className={TOP_NAV_STANDARD_CLASSES}
      >
        Community
        <IconVerticalChevron isPointingUp={openMenuName === 'community'} />
      </button>
      {currentUser ? (
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
    <Link href="/blog" className={TOP_NAV_STANDARD_CLASSES}>
      Blog
    </Link>
  </div>
)
