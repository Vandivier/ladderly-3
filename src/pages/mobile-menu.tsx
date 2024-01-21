import { BlitzPage } from "@blitzjs/next"
import Link from "next/link"
import { useRouter } from "next/router"
import React from "react"
import { TopNavFlexContainer } from "src/core/components/page-wrapper/TopNav"
import { TopNavLeft } from "src/core/components/page-wrapper/TopNavLeft"
import { TOP_NAV_STANDARD_CLASSES } from "src/core/components/page-wrapper/TopNavRight"

const MobileMenuPage: BlitzPage = () => {
  const router = useRouter()

  const handleClose = () => {
    router.back()
  }

  return (
    <div className="inset-0 flex flex-col items-center justify-between bg-white">
      <TopNavFlexContainer>
        <TopNavLeft />
        <button onClick={handleClose} className={`${TOP_NAV_STANDARD_CLASSES} ml-auto`}>
          Close
        </button>
      </TopNavFlexContainer>

      <nav className="mt-25%">
        <ul>
          <li className="my-2">
            <Link className="text-lg text-gray-700 hover:text-gray-900" href="/about">
              About
            </Link>
          </li>
          <li className="my-2">
            <Link className="text-lg text-gray-700 hover:text-gray-900" href="/blog">
              Blog
            </Link>
          </li>
          <li className="my-2">
            <Link className="text-lg text-gray-700 hover:text-gray-900" href="/community">
              Community
            </Link>
          </li>
          <li className="my-2">
            <Link className="text-lg text-gray-700 hover:text-gray-900" href="/auth/login">
              Login
            </Link>
          </li>
          <li className="my-2">
            <Link className="text-lg text-gray-700 hover:text-gray-900" href="/auth/signup">
              Signup
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default MobileMenuPage
