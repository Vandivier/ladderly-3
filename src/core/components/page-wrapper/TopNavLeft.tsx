import Link from "next/link"
import { IconHome } from "../icons/Home"

export const TopNavLeft = () => (
  <Link href="/" className="mr-auto">
    <IconHome />
  </Link>
)
