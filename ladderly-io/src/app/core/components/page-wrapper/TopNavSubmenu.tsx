'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import React from 'react'

import { MenuContext, MenuItemsWrapper } from './MenuProvider'

export const TOP_NAV_STANDARD_CLASSES = 'ml-6 font-bold'
export const MENU_ITEM_STANDARD_CLASSES =
  'font-semibold block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-purple-300/20'
const DESKTOP_MENU_ITEM_STANDARD_CLASSES = `${MENU_ITEM_STANDARD_CLASSES} dark:text-gray-100`

export const AccountMenuItems = ({
  userId,
  linkClassName = DESKTOP_MENU_ITEM_STANDARD_CLASSES,
}: {
  userId: string
  linkClassName?: string
}) =>
  userId ? (
    <MenuItemsWrapper>
      <Link href={`/community/${userId}`} className={linkClassName}>
        My Profile
      </Link>
      <Link href="/settings" className={linkClassName}>
        Settings
      </Link>
      <LogoutButton className={linkClassName} />
    </MenuItemsWrapper>
  ) : null

export const CommunityMenuItems = ({
  linkClassName = DESKTOP_MENU_ITEM_STANDARD_CLASSES,
}: {
  linkClassName?: string
}) => (
  <MenuItemsWrapper>
    <Link href="/community" className={linkClassName}>
      Browse Profiles
    </Link>
    <Link
      href="https://discord.com/invite/fAg6Xa4uxc"
      className={linkClassName}
      target="_blank"
    >
      Discord
    </Link>
  </MenuItemsWrapper>
)

export const GrowMenuItems = ({
  linkClassName = DESKTOP_MENU_ITEM_STANDARD_CLASSES,
}: {
  linkClassName?: string
}) => (
  <MenuItemsWrapper>
    <Link href="/blog" className={linkClassName}>
      Blog
    </Link>
    <Link href="/copilot" className={linkClassName}>
      Copilot
    </Link>
    <Link href="/job-search" className={linkClassName}>
      Job Search
    </Link>
    <Link href="/leetcode-tool" className={linkClassName}>
      Leetcode Tool
    </Link>
  </MenuItemsWrapper>
)

const LogoutButton = ({ className }: { className: string }) => {
  const { setMenu } = React.useContext(MenuContext)

  return (
    <button
      className={className}
      onClick={() => {
        setMenu?.(null, '')
        void signOut({
          callbackUrl: '/',
        })
      }}
    >
      Log Out
    </button>
  )
}
