import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import Link from "next/link"
import React from "react"

import logout from "src/auth/mutations/logout"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"

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

// TODO: implement static form
export const TopNavRight = () => {
  const currentUser = useCurrentUser()
  return (
    <>
      <div className="ml-auto space-x-6">
        <React.Suspense fallback="loading...">
          <Link href={Routes.SettingsPage()} className="font-bold">
            Settings
          </Link>
          {currentUser ? <LogoutButton /> : null}

          {currentUser ? (
            <Link
              href={Routes.ShowUserPage({ userId: currentUser.id })}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              My Profile
            </Link>
          ) : null}
        </React.Suspense>
      </div>
    </>
  )
}
