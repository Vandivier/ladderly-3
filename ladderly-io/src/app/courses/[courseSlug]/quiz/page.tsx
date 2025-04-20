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
      title: 'Quiz Not Found',
      description: 'The requested quiz could not be found.',
    }
  }

  return {
    title: `${course.title} Quiz - Ladderly Courses`,
    description: `Test your knowledge of ${course.title} with this comprehensive quiz.`,
  }
}

export default function CourseQuizPage({
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
            Quiz Coming Soon
          </h2>

          <div className="prose max-w-none dark:prose-invert">
            <p>The quiz for {course.title} is currently being developed.</p>
            <p>
              Check back soon for an interactive quiz to test your understanding
              of the key concepts from this course.
            </p>
          </div>
        </div>
      </div>
    </LadderlyPageWrapper>
  )
}
