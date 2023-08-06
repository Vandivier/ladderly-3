import { Routes } from "@blitzjs/next"
import Link from "next/link"
import React from "react"

import { IconVerticalChevron } from "../icons/VerticalChevron"

export const TopNavCenter = () => {
  const [isCommunityOpen, setCommunityOpen] = React.useState(false)

  return (
    <>
      <Link href={Routes.BlogIndex()} className="font-bold">
        Blog
      </Link>

      <div className="group relative inline-block" onMouseEnter={() => setCommunityOpen(true)}>
        <Link href={Routes.CommunityPage()} className="ml-6 font-bold">
          Community
          <IconVerticalChevron isPointingUp={!isCommunityOpen} />
        </Link>
        {isCommunityOpen && (
          <div className="absolute left-0 z-10 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div
              className="py-1"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu"
            >
              <Link
                href={Routes.CommunityPage()}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                Hall of Fame
              </Link>
              <Link
                href={Routes.CommunityPage()}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                Browse All Profiles
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
