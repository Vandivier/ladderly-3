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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-white">
      <TopNavFlexContainer>
        <TopNavLeft />
        <button onClick={handleClose} className={`${TOP_NAV_STANDARD_CLASSES} ml-auto`}>
          Close
        </button>
      </TopNavFlexContainer>

      <nav className="flex flex-col items-center justify-center">
        <ul>
          <li className="my-2">
            <Link className="text-lg text-gray-700 hover:text-gray-900" href="/about">
              About
            </Link>
          </li>
          <li className="my-2">
            <Link className="text-lg text-gray-700 hover:text-gray-900" href="/services">
              Services
            </Link>
          </li>
          <li className="my-2">
            <Link className="text-lg text-gray-700 hover:text-gray-900" href="/portfolio">
              Portfolio
            </Link>
          </li>
          <li className="my-2">
            <Link className="text-lg text-gray-700 hover:text-gray-900" href="/blog">
              Blog
            </Link>
          </li>
          <li className="my-2">
            <Link className="text-lg text-gray-700 hover:text-gray-900" href="/contact">
              Contact
            </Link>
          </li>
        </ul>
      </nav>
      <div className="w-full p-5">{/* Footer or additional content here */}</div>
    </div>
  )
}

export default MobileMenuPage
