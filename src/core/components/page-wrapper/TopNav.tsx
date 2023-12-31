import React from "react"

import { TopNavLeft } from "./TopNavLeft"
import { TopNavRight, TopNavRightSkeleton } from "./TopNavRight"
import { MenuContext, MenuProvider } from "./MenuProvider"

export const TopNav = () => (
  <MenuProvider>
    <InnerTopNav />
  </MenuProvider>
)

const InnerTopNav = () => {
  const { menuContent } = React.useContext(MenuContext)

  return (
    <div className="border-ladderly-light-purple column flex flex-col border bg-ladderly-off-white px-4 py-1 text-ladderly-violet-700">
      <div className="flex w-full">
        <TopNavLeft />

        <React.Suspense fallback={<TopNavRightSkeleton />}>
          <TopNavRight />
        </React.Suspense>
      </div>

      {menuContent ? <div className="flex w-full">{menuContent}</div> : null}
    </div>
  )
}
