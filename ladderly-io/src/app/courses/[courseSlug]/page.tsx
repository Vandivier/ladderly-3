import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { createCaller } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// This enables static rendering with dynamic data
export const revalidate = 3600 // revalidate the data at most every hour

export async function generateStaticParams() {
  // Get all courses to generate static paths
  const caller = createCaller(
    await createTRPCContext({ headers: new Headers() }),
  )
  const courses = await caller.course.getAll()

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
    const caller = createCaller(
      await createTRPCContext({ headers: new Headers() }),
    )
    const course = await caller.course.getBySlug({ slug: params.courseSlug })

    return {
      title: `${course.title} - Ladderly Courses`,
      description: course.description,
    }
  } catch (error) {
    return {
      title: 'Course Not Found',
      description: 'The requested course could not be found.',
    }
  }
}

export default async function CoursePage({
  params,
}: {
  params: { courseSlug: string }
}) {
  try {
    const caller = createCaller(
      await createTRPCContext({ headers: new Headers() }),
    )
    const course = await caller.course.getBySlug({ slug: params.courseSlug })

    // Get the main content item (first item)
    const mainContentItem = course.contentItems.find((item) => item.order === 0)

    return (
      <LadderlyPageWrapper>
        <div className="container mx-auto max-w-5xl px-4 py-8">
          <div className="mb-6 flex items-center">
            <Link
              href={{
                pathname: '/courses',
              }}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ← Back to Courses
            </Link>
          </div>

          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            {course.title}
          </h1>

          <p className="mb-8 text-lg text-gray-700 dark:text-gray-300">
            {course.description}
          </p>

          {mainContentItem && mainContentItem.contentUrl && (
            <div className="mb-8 rounded-md bg-blue-50 p-6 dark:bg-blue-900/30">
              <h2 className="mb-3 text-xl font-semibold text-blue-900 dark:text-blue-200">
                Primary Course Material
              </h2>
              <p className="mb-4 text-blue-800 dark:text-blue-300">
                {mainContentItem.description}
              </p>
              <a
                href={mainContentItem.contentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Read Full Article
              </a>
            </div>
          )}

          <div className="mb-8 flex flex-wrap gap-4">
            {course.flashCardDecks.length > 0 && (
              <Link
                href={{
                  pathname: `/courses/${course.slug}/flashcards`,
                }}
                className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-green-500 dark:hover:bg-green-600"
              >
                Flash Cards
              </Link>
            )}

            {course.quizzes.length > 0 && (
              <Link
                href={{
                  pathname: `/courses/${course.slug}/quiz`,
                }}
                className="inline-flex items-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:bg-purple-500 dark:hover:bg-purple-600"
              >
                Quiz
              </Link>
            )}
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-700">
            <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
              Additional Course Content
            </h2>

            <div className="space-y-6">
              {course.contentItems
                .filter((item) => item.order !== 0) // Skip the main content
                .map((item) => (
                  <div
                    key={item.id}
                    className="rounded-md bg-gray-50 p-4 dark:bg-gray-800"
                  >
                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="mb-3 text-gray-600 dark:text-gray-300">
                        {item.description}
                      </p>
                    )}

                    {item.contentUrl && item.contentType === 'VIDEO' && (
                      <div className="mt-4">
                        <a
                          href={item.contentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          Watch Video
                        </a>
                      </div>
                    )}

                    {item.contentUrl && item.contentType === 'LINK' && (
                      <div className="mt-4">
                        <a
                          href={item.contentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          View Resource
                        </a>
                      </div>
                    )}

                    {item.contentType === 'EXERCISE' && (
                      <div className="mt-4 rounded-md bg-blue-50 p-3 dark:bg-blue-900">
                        <p className="text-blue-800 dark:text-blue-200">
                          Practice Exercise: Complete the tasks described above.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </LadderlyPageWrapper>
    )
  } catch (error) {
    notFound()
  }
}
