import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import Link from "next/link"
import React from "react"

import logout from "src/auth/mutations/logout"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"

export const TOP_NAV_STANDARD_CLASSES = "ml-6 font-bold"
export const MENU_ITEM_STANDARD_CLASSES =
  "font-semibold block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"

export const AccountMenuItems = ({
  linkClassName = MENU_ITEM_STANDARD_CLASSES,
}: {
  linkClassName?: string
}) => {
  const currentUser = useCurrentUser()
  const userId = currentUser?.id

  return userId ? (
    <MenuItemsWrapper>
      <Link href={Routes.ShowUserPage({ userId })} className={linkClassName}>
        My Profile
      </Link>
      <Link href={Routes.SettingsPage()} className={linkClassName}>
        Settings
      </Link>
      <LogoutButton className={linkClassName} />
    </MenuItemsWrapper>
  ) : null
}

const MenuItemsWrapper = ({ children }: { children: React.ReactNode }) => (
  <div
    className="ml-auto flex flex-wrap py-1"
    role="menu"
    aria-orientation="vertical"
    aria-labelledby="options-menu"
  >
    {children}
  </div>
)

export const CommunityMenuItems = ({
  linkClassName = MENU_ITEM_STANDARD_CLASSES,
}: {
  linkClassName?: string
}) => (
  <MenuItemsWrapper>
    <Link href={Routes.HallOfFamePage()} className={linkClassName}>
      Hall of Fame
    </Link>
    <Link href={Routes.CommunityPage()} className={linkClassName}>
      Browse All Profiles
    </Link>
    <Link href="https://discord.com/invite/fAg6Xa4uxc" className={linkClassName} target="_blank">
      Discord
    </Link>
  </MenuItemsWrapper>
)

const LogoutButton = ({ className }: { className: string }) => {
  const [logoutMutation] = useMutation(logout)

  return (
    <button
      className={className}
      onClick={async () => {
        await logoutMutation()
      }}
    >
      Log Out
    </button>
  )
}
