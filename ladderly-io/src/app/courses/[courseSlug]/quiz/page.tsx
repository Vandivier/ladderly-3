import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import QuizContent from './QuizContent'

// This page needs to be rendered dynamically since it uses API calls that require headers
export const dynamic = 'force-dynamic'
// We still set a revalidation period of 1 hour in case dynamic rendering is bypassed
export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: { courseSlug: string }
}) {
  // Provide a generic metadata that doesn't require API calls
  return {
    title: `Quiz - Ladderly Courses`,
    description: `Test your knowledge with this comprehensive quiz.`,
    alternates: {
      canonical: `/courses/${params.courseSlug}/quiz`,
    },
  }
}

export default function CourseQuizPage({
  params,
}: {
  params: { courseSlug: string }
}) {
  // Wrap the entire page with authentication
  return (
    <LadderlyPageWrapper authenticate requirePremium>
      <QuizContent courseSlug={params.courseSlug} />
    </LadderlyPageWrapper>
  )
}
