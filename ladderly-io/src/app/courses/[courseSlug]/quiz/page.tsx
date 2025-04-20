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
      title: `${course.title} Quiz - Ladderly Courses`,
      description: `Test your knowledge of ${course.title} with this comprehensive quiz.`,
    }
  } catch (error) {
    return {
      title: 'Quiz Not Found',
      description: 'The requested quiz could not be found.',
    }
  }
}

export default async function CourseQuizPage({
  params,
}: {
  params: { courseSlug: string }
}) {
  try {
    const course = await api.course.getBySlug({ slug: params.courseSlug })

    // Check if there are any quizzes
    if (course.quizzes.length === 0) {
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
              {course.title} Quiz
            </h1>

            <p className="mb-8 text-lg text-gray-700 dark:text-gray-300">
              Test your knowledge of {course.title} concepts with this
              interactive quiz.
            </p>

            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-700">
              <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
                Quiz Coming Soon
              </h2>

              <div className="prose max-w-none dark:prose-invert">
                <p>The quiz for {course.title} is currently being developed.</p>
                <p>
                  Check back soon for an interactive quiz to test your
                  understanding of the key concepts from this course.
                </p>
              </div>
            </div>
          </div>
        </LadderlyPageWrapper>
      )
    }

    // In a real implementation, you would fetch the specific quiz data
    // For now, we'll just show a placeholder
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
            {course.title} Quiz
          </h1>

          <p className="mb-8 text-lg text-gray-700 dark:text-gray-300">
            Test your knowledge of {course.title} concepts with this interactive
            quiz.
          </p>

          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-700">
            <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
              Quiz: {course.quizzes[0]?.name || 'Course Quiz'}
            </h2>

            <div className="prose max-w-none dark:prose-invert">
              <p>
                {course.quizzes[0]?.description ||
                  'Test your knowledge with this quiz.'}
              </p>
              <p>The interactive quiz feature is coming soon.</p>
            </div>
          </div>
        </div>
      </LadderlyPageWrapper>
    )
  } catch (error) {
    notFound()
  }
}
