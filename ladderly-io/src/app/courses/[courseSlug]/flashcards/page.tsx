import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import FlashcardsContent from './FlashcardsContent'

// This enables static rendering with dynamic data
export const revalidate = 3600 // revalidate the data at most every hour

export async function generateMetadata({
  params,
}: {
  params: { courseSlug: string }
}) {
  // Provide a generic metadata that doesn't require API calls
  return {
    title: `Flashcards - Ladderly Courses`,
    description: `Practice concepts with these flashcards.`,
  }
}

export default function CourseFlashcardsPage({
  params,
}: {
  params: { courseSlug: string }
}) {
  // Wrap the entire page with authentication
  return (
    <LadderlyPageWrapper authenticate requirePremium>
      <FlashcardsContent courseSlug={params.courseSlug} />
    </LadderlyPageWrapper>
  )
}
