import {
  AppProps,
  ErrorBoundary,
  ErrorComponent,
  ErrorFallbackProps,
  Routes,
} from "@blitzjs/next"
import { Analytics } from "@vercel/analytics/react"
import { AuthenticationError, AuthorizationError } from "blitz"
import Link from "next/link"
import { GoogleAnalytics } from "nextjs-google-analytics"
import React from "react"
import { withBlitz } from "src/blitz-client"
import { LargeCard } from "src/core/components/LargeCard"
import { LadderlyPageWrapper } from "src/core/components/page-wrapper/LadderlyPageWrapper"

import "src/core/styles/index.css"
import "src/styles/globals.css"

const UserExceptionWrapper = ({
  error,
}: {
  error: Error & Record<any, any>
}) => (
  <LadderlyPageWrapper title="Error">
    <LargeCard>
      <div>
        <h1 className="text-center text-3xl text-ladderly-violet-600">Error</h1>
        <h2 className="mb-3 mt-5 text-xl">
          {error instanceof AuthenticationError
            ? "You are not logged in."
            : "You are not authorized to access this."}
        </h2>

        <div>
          {error instanceof AuthenticationError ? (
            <div>
              <Link
                className="ml-auto text-gray-800 hover:text-ladderly-pink"
                href={Routes.LoginPage()}
              >
                Log In
              </Link>
              <p>
                <span>Not a member yet?</span>{" "}
                <Link
                  className="ml-auto text-gray-800 hover:text-ladderly-pink"
                  href={Routes.CreateAccountPage()}
                >
                  Create an account for free!
                </Link>
              </p>
            </div>
          ) : (
            <Link
              className="ml-auto text-gray-800 hover:text-ladderly-pink"
              href="/"
            >
              Back to Home
            </Link>
          )}
        </div>
      </div>
    </LargeCard>
  </LadderlyPageWrapper>
)

// TODO: merge w ladderly-3/src/app/error.tsx
function RootErrorFallback({ error }: ErrorFallbackProps) {
  if (
    error instanceof AuthenticationError ||
    error instanceof AuthorizationError
  ) {
    return <UserExceptionWrapper error={error} />
  }

  return (
    <ErrorComponent
      statusCode={(error as any)?.statusCode || 400}
      title={error.message || error.name}
    />
  )
}

function MyApp({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || ((page) => page)
  return (
    <>
      <GoogleAnalytics trackPageViews />
      <ErrorBoundary FallbackComponent={RootErrorFallback}>
        {getLayout(<Component {...pageProps} />)}
      </ErrorBoundary>
      <Analytics />
    </>
  )
}

export default withBlitz(MyApp)
