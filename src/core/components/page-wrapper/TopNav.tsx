import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import Link from "next/link"
import logout from "src/auth/mutations/logout"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"
import { HomeIcon } from "./HomeIcon"

const LogoutButton = () => {
  const [logoutMutation] = useMutation(logout)

  return (
    <button
      className="ml-6"
      onClick={async () => {
        await logoutMutation()
      }}
    >
      <strong>Logout</strong>
    </button>
  )
}

export const TopNav = () => {
  const currentUser = useCurrentUser()

  if (currentUser) {
    return (
      <>
        <Link href={Routes.Home()} style={{ marginRight: "auto" }}>
          <HomeIcon />
        </Link>

        <p style={{ marginLeft: "auto" }}>
          <Link href={Routes.BlogIndex()} className="ml-6">
            <strong>Blog</strong>
          </Link>
          <Link href={Routes.CommunityPage()} className="ml-6">
            <strong>Community</strong>
          </Link>
          <Link href={Routes.SettingsPage()} className="ml-6">
            <strong>Settings</strong>
          </Link>
          <LogoutButton />
        </p>
      </>
    )
  } else {
    return (
      <p style={{ marginLeft: "auto" }}>
        <Link href={Routes.BlogIndex()} className="ml-6">
          <strong>Blog</strong>
        </Link>
        <Link href={Routes.CommunityPage()} className="ml-6">
          <strong>Community</strong>
        </Link>
        <Link href={Routes.LoginPage()} className="ml-6">
          <strong>Login</strong>
        </Link>
        <Link href={Routes.SignupPage()} className="ml-6">
          <strong>Signup</strong>
        </Link>
      </p>
    )
  }
}
