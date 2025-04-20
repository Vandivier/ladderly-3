import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import QuizContent from './QuizContent'

// This enables static rendering with dynamic data
export const revalidate = 3600 // revalidate the data at most every hour

export async function generateMetadata({
  params,
}: {
  params: { courseSlug: string }
}) {
  // Provide a generic metadata that doesn't require API calls
  return {
    title: `Quiz - Ladderly Courses`,
    description: `Test your knowledge with this comprehensive quiz.`,
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
