import { Routes } from "@blitzjs/next"
import Link from "next/link"
import { IconHome } from "../icons/Home"

export const TopNavLeft = () => (
  <Link href={Routes.Home()} className="mr-auto">
    <IconHome />
  </Link>
)
