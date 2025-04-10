'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { Suspense } from 'react'
import { IconVerticalChevron } from '~/app/core/components/icons/VerticalChevron'
import { TopNavFlexContainer } from '~/app/core/components/page-wrapper/TopNav'
import { TopNavLeft } from '~/app/core/components/page-wrapper/TopNavLeft'
import {
  AccountMenuItems,
  CommunityMenuItems,
  MENU_ITEM_STANDARD_CLASSES,
  TOP_NAV_STANDARD_CLASSES,
} from '~/app/core/components/page-wrapper/TopNavSubmenu'
import { ThemeProvider } from '~/app/core/theme/ThemeContext'
import { type LadderlySession } from '~/server/auth'
import { LadderlyAnalytics } from '../core/components/LadderlyAnalytics'

const MOBILE_LINK_CLASSES =
  'block rounded-lg bg-white p-4 py-2 text-lg text-gray-700 shadow hover:text-gray-900'
const MOBILE_SUBMENU_ITEM_CLASSES = `${MENU_ITEM_STANDARD_CLASSES} m-3`

const AuthenticatedMenuItems = ({ session }: { session: LadderlySession }) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = React.useState(false)

  const toggleAccountSubmenu = () => {
    setIsSubmenuOpen(!isSubmenuOpen)
  }

  return (
    <>
      <li>
        <button
          onClick={toggleAccountSubmenu}
          className={`${MOBILE_LINK_CLASSES} flex items-center justify-between ${
            isSubmenuOpen && 'border border-gray-200 bg-gray-100'
          }`}
        >
          Account
          <IconVerticalChevron isPointingUp={isSubmenuOpen} />
        </button>

        {isSubmenuOpen && (
          <ul className="flex w-full">
            <AccountMenuItems
              userId={session.user?.id ?? ''}
              linkClassName={MOBILE_SUBMENU_ITEM_CLASSES}
            />
          </ul>
        )}
      </li>
    </>
  )
}

const GuestMenuItems = () => {
  return (
    <>
      <li>
        <Link href="/login" className={MOBILE_LINK_CLASSES}>
          Log In
        </Link>
      </li>
      <li>
        <Link href="/signup" className={MOBILE_LINK_CLASSES}>
          Create Account
        </Link>
      </li>
    </>
  )
}

const AuthenticatedPartialMenu = ({
  session,
}: {
  session: LadderlySession | null
}) => {
  return session?.user ? (
    <AuthenticatedMenuItems session={session} />
  ) : (
    <GuestMenuItems />
  )
}

export function MobileMenuContent({
  session,
}: {
  session: LadderlySession | null
}) {
  const router = useRouter()
  const [isCommunitySubmenuOpen, setIsCommunitySubmenuOpen] =
    React.useState(false)

  const handleClose = () => {
    router.back()
  }

  const toggleCommunitySubmenu = () => {
    setIsCommunitySubmenuOpen(!isCommunitySubmenuOpen)
  }

  return (
    <ThemeProvider>
      <LadderlyAnalytics />
      <div className="fixed inset-0 flex flex-col bg-ladderly-light-purple-1">
        <TopNavFlexContainer>
          <TopNavLeft />
          <button
            onClick={handleClose}
            className={`${TOP_NAV_STANDARD_CLASSES} ml-auto`}
          >
            Close
          </button>
        </TopNavFlexContainer>

        <nav className="mt-25% grow overflow-y-auto px-4">
          <ul className="grid grid-cols-2 gap-4">
            <Suspense fallback={<p>Loading...</p>}>
              <AuthenticatedPartialMenu session={session} />
            </Suspense>

            <li>
              <Link href="/about" className={MOBILE_LINK_CLASSES}>
                About
              </Link>
            </li>
            <li>
              <Link href="/perks" className={MOBILE_LINK_CLASSES}>
                Perks
              </Link>
            </li>
            <li>
              <Link href="/blog" className={MOBILE_LINK_CLASSES}>
                Blog
              </Link>
            </li>
            <li>
              <button
                onClick={toggleCommunitySubmenu}
                className={`${MOBILE_LINK_CLASSES} flex items-center justify-between ${
                  isCommunitySubmenuOpen
                    ? 'border border-gray-200 bg-gray-100'
                    : ''
                }`}
              >
                Community
                <IconVerticalChevron isPointingUp={isCommunitySubmenuOpen} />
              </button>
              {isCommunitySubmenuOpen && (
                <ul>
                  <CommunityMenuItems
                    linkClassName={MOBILE_SUBMENU_ITEM_CLASSES}
                  />
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </ThemeProvider>
  )
}
