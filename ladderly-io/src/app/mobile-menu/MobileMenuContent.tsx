'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { Suspense } from 'react'
import { TopNavFlexContainer } from '~/app/core/components/page-wrapper/TopNav'
import { TopNavLeft } from '~/app/core/components/page-wrapper/TopNavLeft'
import { TOP_NAV_STANDARD_CLASSES } from '~/app/core/components/page-wrapper/TopNavSubmenu'
import { ThemeProvider } from '~/app/core/theme/ThemeContext'
import { type LadderlySession } from '~/server/auth'
import { LadderlyAnalytics } from '../core/components/LadderlyAnalytics'
import {
  MOBILE_LINK_CLASSES,
  MobileAccountDropdown,
  MobileCommunityDropdown,
} from './MobileMenuDropdowns'

const AuthenticatedMenuItems = ({ session }: { session: LadderlySession }) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = React.useState(false)

  return (
    <>
      <MobileAccountDropdown
        toggleAccountSubmenu={() => setIsSubmenuOpen(!isSubmenuOpen)}
        isSubmenuOpen={isSubmenuOpen}
        session={session}
      />
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
            <MobileCommunityDropdown
              toggleCommunitySubmenu={toggleCommunitySubmenu}
              isCommunitySubmenuOpen={isCommunitySubmenuOpen}
            />
          </ul>
        </nav>
      </div>
    </ThemeProvider>
  )
}
