import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import Link from "next/link"
import React from "react"

import logout from "src/auth/mutations/logout"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"
import { IconVerticalChevron } from "../icons/VerticalChevron"

const TOP_NAV_STANDARD_CLASSES = "inline-block ml-6 font-bold"
const MENU_ITEM_STANDARD_CLASSES =
  "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"

const CommonItems = () => (
  <>
    <Link href={Routes.BlogIndex()} className={TOP_NAV_STANDARD_CLASSES}>
      Blog
    </Link>
    <CommunityMenu />
  </>
)

export const CommunityMenu = () => {
  const [isCommunityOpen, setCommunityOpen] = React.useState(false)

  const toggleCommunityMenu = (e) => {
    e.preventDefault()
    setCommunityOpen(!isCommunityOpen)
  }

  return (
    <div className={TOP_NAV_STANDARD_CLASSES}>
      <button onClick={toggleCommunityMenu}>
        Community
        <IconVerticalChevron isPointingUp={!isCommunityOpen} />
      </button>
      {isCommunityOpen && (
        <div className="absolute left-0 z-10 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black/5">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <Link href={Routes.CommunityPage()} className={MENU_ITEM_STANDARD_CLASSES}>
              Hall of Fame
            </Link>
            <Link href={Routes.CommunityPage()} className={MENU_ITEM_STANDARD_CLASSES}>
              Browse All Profiles
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

const LogoutButton = () => {
  const [logoutMutation] = useMutation(logout)

  return (
    <button
      className={MENU_ITEM_STANDARD_CLASSES}
      onClick={async () => {
        await logoutMutation()
      }}
    >
      Logout
    </button>
  )
}

const TopNavRightLoggedIn = ({ userId }: { userId: number }) => {
  const [isAccountOpen, setAccountOpen] = React.useState(false)

  const toggleAccountMenu = (e) => {
    e.preventDefault()
    setAccountOpen(!isAccountOpen)
  }

  return (
    <div className={TOP_NAV_STANDARD_CLASSES}>
      <button onClick={toggleAccountMenu}>
        Account
        <IconVerticalChevron isPointingUp={!isAccountOpen} />
      </button>
      {isAccountOpen && (
        <div className="absolute left-0 z-10 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black/5">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <Link href={Routes.ShowUserPage({ userId })} className={MENU_ITEM_STANDARD_CLASSES}>
              My Profile
            </Link>
            <Link href={Routes.SettingsPage()} className={MENU_ITEM_STANDARD_CLASSES}>
              Settings
            </Link>
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  )
}

const TopNavRightLoggedOut = () => (
  <>
    <Link className={TOP_NAV_STANDARD_CLASSES} href={Routes.LoginPage()}>
      Login
    </Link>
    <Link className={TOP_NAV_STANDARD_CLASSES} href={Routes.SignupPage()}>
      Signup
    </Link>
  </>
)

export const TopNavRight = () => {
  const currentUser = useCurrentUser()

  return (
    <>
      <div className="ml-auto space-x-6">
        <div className="group relative inline-block">
          <CommonItems />
          {currentUser ? <TopNavRightLoggedIn userId={currentUser.id} /> : <TopNavRightLoggedOut />}
        </div>
      </div>
    </>
  )
}

export const TopNavRightSkeleton = () => (
  <div className="ml-auto space-x-6">
    <div className="h-4 w-16 rounded bg-gray-200"></div>
  </div>
)
