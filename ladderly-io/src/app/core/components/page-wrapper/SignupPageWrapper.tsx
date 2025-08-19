import Link from 'next/link'
import { SignupForm } from '~/app/(auth)/components/SignupForm'
import { TestimonialBlock } from '~/app/home/TestimonialBlock'
import { getServerAuthSession, type LadderlySession } from '~/server/auth'
import { LadderlyAnalytics } from '../LadderlyAnalytics' // Adjusted path as per user instruction

const HomePageCardSubheading = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <h2 className="mb-2 font-semibold text-ladderly-violet-700">{children}</h2>
)

interface SignupPageWrapperProps {
  valueProps: string[]
  heroHeadline: string
}

export const SignupPageWrapper = async ({
  valueProps,
  heroHeadline,
}: SignupPageWrapperProps) => {
  const session: LadderlySession | null = await getServerAuthSession()
  const dashboardHref = '/'

  return (
    <div className="flex min-h-screen flex-col bg-ladderly-off-white">
      <LadderlyAnalytics />

      <main className="flex flex-grow justify-center p-2 md:items-center">
        <div
          id="signup-page-card"
          className="w-full max-w-4xl rounded-xl bg-white p-4 shadow-xl md:grid md:grid-cols-2 md:gap-8 md:p-8"
        >
          {/* Left Column: Value Proposition & Testimonials */}
          <div className="flex flex-col justify-center space-y-4 text-sm">
            <div>
              <h1 className="mb-2 font-bold tracking-tight text-ladderly-violet-700 sm:text-4xl md:mb-4">
                {heroHeadline}
              </h1>
              <ul className="space-y-2 text-gray-700">
                {valueProps.map((prop, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="mr-2 mt-1 size-5 flex-shrink-0 text-ladderly-pink"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span>{prop}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <HomePageCardSubheading>
                Why Users Love Us:
              </HomePageCardSubheading>
              <TestimonialBlock />
            </div>
          </div>

          {/* Right Column: Signup Form */}
          <div className="mt-2 flex flex-col items-center justify-center md:mt-0">
            {session?.user ? (
              <div className="text-center">
                <p className="text-xl text-gray-700">
                  You are already logged in.
                </p>
                <Link
                  href={dashboardHref}
                  className="hover:bg-ladderly-pink-dark mt-4 inline-block rounded-md bg-ladderly-pink px-6 py-2 font-semibold text-white"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div className="w-full max-w-md">
                <SignupForm />
                <p className="mt-6 text-center text-xs text-gray-600">
                  By signing up, you agree to our{' '}
                  <Link
                    href="/privacy-policy"
                    className="underline hover:text-ladderly-pink"
                  >
                    Terms of Service
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
