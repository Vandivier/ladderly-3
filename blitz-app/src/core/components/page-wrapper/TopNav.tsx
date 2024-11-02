'use client'

import Link from 'next/link'
import React from 'react'
import { MenuContext, MenuProvider } from './MenuProvider'
import { TopNavLeft } from './TopNavLeft'
import { TopNavRight, TopNavRightSkeleton } from './TopNavRight'
import { TOP_NAV_STANDARD_CLASSES } from './TopNavSubmenu'

export const TopNavFlexContainer = ({ children }) => (
  <div className="column flex w-full items-center border-b border-ladderly-light-purple-5 bg-ladderly-light-purple-2 px-4 py-1 text-ladderly-violet-700 dark:bg-ladderly-dark-purple-2 dark:text-white">
    {children}
  </div>
)

export const TopNav = () => (
  <TopNavFlexContainer>
    <TopNavLeft />
    <div className={`${TOP_NAV_STANDARD_CLASSES} ml-auto md:hidden`}>
      <Link href="/mobile-menu">Mobile Menu</Link>
    </div>

    <div className="hidden w-full md:block">
      <MenuProvider>
        <InnerTopNav />
      </MenuProvider>
    </div>
  </TopNavFlexContainer>
)

const InnerTopNav = () => {
  const { menuContent } = React.useContext(MenuContext)

  return (
    <>
      <div className="flex w-full">
        <React.Suspense fallback={<TopNavRightSkeleton />}>
          <TopNavRight />
        </React.Suspense>
      </div>

      {menuContent ? <div className="flex w-full">{menuContent}</div> : null}
    </>
  )
}

export default TopNav
