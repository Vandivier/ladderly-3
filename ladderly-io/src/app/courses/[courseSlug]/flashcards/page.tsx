import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { api } from '~/trpc/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// This enables static rendering with dynamic data
export const revalidate = 3600 // revalidate the data at most every hour

export async function generateStaticParams() {
  // Get all courses to generate static paths
  const courses = await api.course.getAll()

  return courses.map((course) => ({
    courseSlug: course.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: { courseSlug: string }
}) {
  try {
    const course = await api.course.getBySlug({ slug: params.courseSlug })

    return {
      title: `${course.title} Flashcards - Ladderly Courses`,
      description: `Practice ${course.title} concepts with these flashcards.`,
    }
  } catch (error) {
    return {
      title: 'Flashcards Not Found',
      description: 'The requested flashcards could not be found.',
    }
  }
}

export default async function CourseFlashcardsPage({
  params,
}: {
  params: { courseSlug: string }
}) {
  try {
    const course = await api.course.getBySlug({ slug: params.courseSlug })

    // Check if there are any flashcard decks
    if (course.flashCardDecks.length === 0) {
      return (
        <LadderlyPageWrapper authenticate requirePremium>
          <div className="container mx-auto max-w-5xl px-4 py-8">
            <div className="mb-6 flex items-center">
              <Link
                href={`/courses/${course.slug}`}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                ← Back to {course.title}
              </Link>
            </div>

            <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              {course.title} Flashcards
            </h1>

            <p className="mb-8 text-lg text-gray-700 dark:text-gray-300">
              Test your knowledge of {course.title} concepts with these
              flashcards.
            </p>

            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-700">
              <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
                Flashcards Coming Soon
              </h2>

              <div className="prose max-w-none dark:prose-invert">
                <p>
                  Flashcards for {course.title} are currently being developed.
                </p>
                <p>
                  Check back soon for interactive flashcards to help you master
                  the key concepts from this course.
                </p>
              </div>
            </div>
          </div>
        </LadderlyPageWrapper>
      )
    }

    // In a real implementation, you would fetch the specific flashcard deck
    // and display its cards. For now, we'll just show a placeholder
    return (
      <LadderlyPageWrapper>
        <div className="container mx-auto max-w-5xl px-4 py-8">
          <div className="mb-6 flex items-center">
            <Link
              href={`/courses/${course.slug}`}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ← Back to {course.title}
            </Link>
          </div>

          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            {course.title} Flashcards
          </h1>

          <p className="mb-8 text-lg text-gray-700 dark:text-gray-300">
            Test your knowledge of {course.title} concepts with these
            flashcards.
          </p>

          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-700">
            <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
              Flashcard Deck:{' '}
              {course.flashCardDecks[0]?.name || 'Course Flashcards'}
            </h2>

            <div className="prose max-w-none dark:prose-invert">
              <p>
                {course.flashCardDecks[0]?.description ||
                  'Practice with these flashcards to reinforce your learning.'}
              </p>
              <p>The interactive flashcard feature is coming soon.</p>
            </div>
          </div>
        </div>
      </LadderlyPageWrapper>
    )
  } catch (error) {
    notFound()
  }
}
