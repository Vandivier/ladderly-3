import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Course {
  slug: string
  title: string
  description: string
}

const courses: Course[] = [
  {
    slug: 'time-management',
    title: 'Time Management',
    description:
      'Learn effective strategies to manage your time efficiently and boost productivity in your daily work and studies.',
  },
  {
    slug: 'professional-communication',
    title: 'Professional Communication',
    description:
      'Master the art of professional communication in various contexts including emails, presentations, and team interactions.',
  },
  {
    slug: 'front-end-development',
    title: 'Essentials of Front End Development',
    description:
      'Explore the core concepts and technologies that make up modern front-end development, including HTML, CSS, and JavaScript.',
  },
]

export function generateStaticParams() {
  return courses.map((course) => ({
    courseSlug: course.slug,
  }))
}

export function generateMetadata({
  params,
}: {
  params: { courseSlug: string }
}) {
  const course = courses.find((course) => course.slug === params.courseSlug)

  if (!course) {
    return {
      title: 'Course Not Found',
      description: 'The requested course could not be found.',
    }
  }

  return {
    title: `${course.title} - Ladderly Courses`,
    description: course.description,
  }
}

export default function CoursePage({
  params,
}: {
  params: { courseSlug: string }
}) {
  const course = courses.find((course) => course.slug === params.courseSlug)

  if (!course) {
    notFound()
  }

  return (
    <LadderlyPageWrapper>
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center">
          <Link
            href="/courses"
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

        <div className="mb-8 flex flex-wrap gap-4">
          <Link
            href={`/courses/${course.slug}/flashcards`}
            className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-green-500 dark:hover:bg-green-600"
          >
            Flash Cards
          </Link>

          <Link
            href={`/courses/${course.slug}/quiz`}
            className="inline-flex items-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:bg-purple-500 dark:hover:bg-purple-600"
          >
            Quiz
          </Link>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-700">
          <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
            Course Content
          </h2>

          <div className="prose max-w-none dark:prose-invert">
            <p>
              This is the content for the {course.title} course. The actual
              course content will be populated here.
            </p>
            <p>
              This is a placeholder for now. Each course will have its own
              specific content with lessons, exercises, and resources.
            </p>
          </div>
        </div>
      </div>
    </LadderlyPageWrapper>
  )
}
