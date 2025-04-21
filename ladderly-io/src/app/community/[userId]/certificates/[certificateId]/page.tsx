import Image from 'next/image'
import { api } from '~/trpc/server'
import { LargeCard } from '~/app/core/components/LargeCard'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { notFound } from 'next/navigation'
import DownloadButton from './DownloadButton'
import Link from 'next/link'

// Add global styles for print media
import './print.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: { userId: string; certificateId: string }
}) {
  try {
    const userId = parseInt(params.userId)
    const certificateId = parseInt(params.certificateId)

    const certificate = await api.certificate.getCertificate({
      userId,
      quizResultId: certificateId,
    })

    const courseName = certificate.quiz.course?.title ?? 'Course'
    const userName = `${certificate.user.nameFirst} ${certificate.user.nameLast}`

    return {
      title: `${userName} - ${courseName} Certificate`,
      description: `Certificate of completion for ${courseName}`,
      openGraph: {
        title: `${userName} - ${courseName} Certificate`,
        description: `Certificate of completion for ${courseName}`,
      },
    }
  } catch (error) {
    return {
      title: 'Certificate',
      description: 'Ladderly course certificate',
    }
  }
}

export default async function CertificatePage({
  params,
}: {
  params: { userId: string; certificateId: string }
}) {
  const userId = parseInt(params.userId)
  const certificateId = parseInt(params.certificateId)

  try {
    const certificate = await api.certificate.getCertificate({
      userId,
      quizResultId: certificateId,
    })

    const isPubliclyVisible = certificate.user.hasPublicProfileEnabled

    if (!isPubliclyVisible) {
      // Check if the user is viewing their own certificate
      // If not, show a "Certificate is private" message
      // For now, let's show it as private
      return (
        <LadderlyPageWrapper>
          <LargeCard>
            <div className="text-center">
              <h1 className="mb-2 text-2xl font-bold">Private Certificate</h1>
              <p>This certificate is not publicly visible.</p>
            </div>
          </LargeCard>
        </LadderlyPageWrapper>
      )
    }

    const dateFormatted = new Date(certificate.createdAt).toLocaleDateString(
      undefined,
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
    )

    const isPerfect = certificate.score === 100
    const courseName = certificate.quiz.course?.title ?? 'Course'

    return (
      <LadderlyPageWrapper>
        <div className="print-hidden print:m-0 print:p-0">
          <div
            id="certificate-print-region"
            className="certificate-container mx-auto mt-6 max-w-4xl px-4 print:p-0"
          >
            <div className="certificate relative overflow-hidden rounded-lg border-8 border-blue-600 bg-white p-8 shadow-xl dark:bg-gray-800 print:mb-0 print:border-4 print:shadow-none">
              {/* Certificate Header */}
              <div className="mb-2 text-center">
                <div className="mb-2 flex justify-center">
                  <Image
                    className="rounded-md"
                    src="/logo.png"
                    alt="Ladderly Logo"
                    width={280}
                    height={280}
                  />
                </div>
                <h1 className="mb-2 text-4xl font-bold tracking-tight text-blue-800 dark:text-blue-400">
                  Certificate of Completion
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  This certifies that
                </p>
              </div>

              {/* Certificate Body */}
              <div className="mb-2 text-center">
                <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                  <Link href={`/community/${userId}`}>
                    {certificate.user.nameFirst} {certificate.user.nameLast}
                  </Link>
                </h2>
                <p className="mb-2 text-xl text-gray-600 dark:text-gray-300">
                  has successfully completed
                </p>
                <h3 className="mb-2 text-2xl font-bold text-blue-700 dark:text-blue-300">
                  <Link href={`/courses/${certificate.quiz.course?.slug}`}>
                    {courseName}
                  </Link>
                </h3>
                <p className="text-md text-gray-600 dark:text-gray-300">
                  with a score of{' '}
                  <span className="font-bold">{certificate.score}%</span>
                  {isPerfect && (
                    <span className="ml-1 font-bold text-yellow-600 dark:text-yellow-400">
                      (With Honors)
                    </span>
                  )}
                </p>
              </div>

              {/* Certificate Footer */}
              <div className="flex flex-col items-center justify-between space-y-4 text-center sm:flex-row sm:space-y-0 sm:text-left">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Issued on {dateFormatted}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Certificate ID: {certificate.id}
                  </p>
                </div>
              </div>

              {/* Sharing Section - hide when printing */}
              <div className="mt-8 rounded-lg bg-gray-50 p-4 dark:bg-gray-700 print:hidden">
                <h4 className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
                  Share Your Achievement
                </h4>
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  Add this certificate to your LinkedIn profile or save it as a
                  PDF.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(courseName)}&organizationName=Ladderly.io&issueYear=${new Date(certificate.createdAt).getFullYear()}&issueMonth=${new Date(certificate.createdAt).getMonth() + 1}&certUrl=https://ladderly.io/community/${userId}/certificates/${certificateId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Add to LinkedIn
                  </a>
                  <DownloadButton />
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute left-0 top-0 size-16 rounded-br-3xl bg-blue-600 opacity-20"></div>
              <div className="absolute bottom-0 right-0 size-16 rounded-tl-3xl bg-blue-600 opacity-20"></div>
              <div className="absolute left-1/3 top-1/4 size-32 rotate-12 rounded-full bg-blue-600 opacity-5"></div>
            </div>
          </div>
        </div>
      </LadderlyPageWrapper>
    )
  } catch (error) {
    return notFound()
  }
}
