import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import Link from "next/link"
import React from "react"

import logout from "src/auth/mutations/logout"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"
import { IconVerticalChevron } from "../icons/VerticalChevron"
import { MenuContext } from "./MenuProvider"

export const TOP_NAV_STANDARD_CLASSES = "ml-6 font-bold"
const TOP_NAV_RIGHT_SECTION_CLASSES = "ml-auto flex items-center space-x-6"
const MENU_ITEM_STANDARD_CLASSES =
  "font-semibold block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"

const MenuItemsWrapper = ({ children }: { children: React.ReactNode }) => (
  <div
    className="ml-auto flex py-1"
    role="menu"
    aria-orientation="vertical"
    aria-labelledby="options-menu"
  >
    {children}
  </div>
)

const CommunityMenuItems = () => (
  <MenuItemsWrapper>
    <Link href={Routes.HallOfFamePage()} className={MENU_ITEM_STANDARD_CLASSES}>
      Hall of Fame
    </Link>
    <Link href={Routes.CommunityPage()} className={MENU_ITEM_STANDARD_CLASSES}>
      Browse All Profiles
    </Link>
    <Link
      href="https://discord.com/invite/fAg6Xa4uxc"
      className={MENU_ITEM_STANDARD_CLASSES}
      target="_blank"
    >
      Discord
    </Link>
  </MenuItemsWrapper>
)

const AccountMenuItems = ({ userId }) => (
  <MenuItemsWrapper>
    <Link href={Routes.ShowUserPage({ userId })} className={MENU_ITEM_STANDARD_CLASSES}>
      My Profile
    </Link>
    <Link href={Routes.SettingsPage()} className={MENU_ITEM_STANDARD_CLASSES}>
      Settings
    </Link>
    <LogoutButton />
  </MenuItemsWrapper>
)

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

export const TopNavRight = () => {
  const currentUser = useCurrentUser()
  const { setMenu, openMenuName } = React.useContext(MenuContext)

  const handleCommunityClick = (e) => {
    e.preventDefault()

    if (openMenuName === "community") {
      setMenu(null, "")
    } else {
      setMenu(<CommunityMenuItems />, "community")
    }
  }

  const handleAccountClick = (e) => {
    e.preventDefault()

    if (openMenuName === "account") {
      setMenu(null, "")
    } else if (currentUser) {
      setMenu(<AccountMenuItems userId={currentUser.id} />, "account")
    }
  }

  return (
    <div className={TOP_NAV_RIGHT_SECTION_CLASSES}>
      <Link href={Routes.StorePage()} className={TOP_NAV_STANDARD_CLASSES}>
        Store
      </Link>
      <Link href={Routes.BlogIndex()} className={TOP_NAV_STANDARD_CLASSES}>
        Blog
      </Link>
      <button onClick={handleCommunityClick} className={TOP_NAV_STANDARD_CLASSES}>
        Community
        <IconVerticalChevron isPointingUp={openMenuName === "community"} />
      </button>
      {currentUser ? (
        <button onClick={handleAccountClick} className={TOP_NAV_STANDARD_CLASSES}>
          Account
          <IconVerticalChevron isPointingUp={openMenuName === "account"} />
        </button>
      ) : (
        <>
          <Link className={TOP_NAV_STANDARD_CLASSES} href={Routes.LoginPage()}>
            Login
          </Link>
          <Link className={TOP_NAV_STANDARD_CLASSES} href={Routes.SignupPage()}>
            Signup
          </Link>
        </>
      )}
    </div>
  )
}

export const TopNavRightSkeleton = () => (
  <div className={TOP_NAV_RIGHT_SECTION_CLASSES}>
    <Link href={Routes.StorePage()} className={TOP_NAV_STANDARD_CLASSES}>
      Store
    </Link>
    <Link href={Routes.BlogIndex()} className={TOP_NAV_STANDARD_CLASSES}>
      Blog
    </Link>
  </div>
)
