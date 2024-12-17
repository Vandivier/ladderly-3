import {
  AppProps,
  ErrorBoundary,
  ErrorComponent,
  ErrorFallbackProps,
} from '@blitzjs/next'
import { AuthenticationError, AuthorizationError } from 'blitz'
import Link from 'next/link'
import { withBlitz } from 'src/app/blitz-client'
import { LargeCard } from 'src/core/components/LargeCard'
import { LadderlyAnalytics } from 'src/core/components/LadderlyAnalytics'
import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'

import 'src/app/styles/globals.css'

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
            ? 'You are not logged in.'
            : 'You are not authorized to access this.'}
        </h2>

        <div>
          {error instanceof AuthenticationError ? (
            <div>
              <Link
                className="ml-auto text-gray-800 hover:text-ladderly-pink"
                href="/login"
              >
                Log In
              </Link>
              <p>
                <span>Not a member yet?</span>{' '}
                <Link
                  className="ml-auto text-gray-800 hover:text-ladderly-pink"
                  href="/signup"
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
    <>
      <LadderlyAnalytics />
      <ErrorComponent
        statusCode={(error as any)?.statusCode || 400}
        title={error.message || error.name}
      />
    </>
  )
}

function MyApp({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || ((page) => page)
  return (
    <>
      <LadderlyAnalytics />
      <ErrorBoundary FallbackComponent={RootErrorFallback}>
        {getLayout(<Component {...pageProps} />)}
      </ErrorBoundary>
    </>
  )
}

export default withBlitz(MyApp)
