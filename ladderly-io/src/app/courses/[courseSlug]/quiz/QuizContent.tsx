'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '~/trpc/react'
import { useRouter } from 'next/navigation'

interface QuizContentProps {
  courseSlug: string
}

export default function QuizContent({ courseSlug }: QuizContentProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Use React Query from trpc/react to fetch course data
  const { data: course, error } = api.course.getBySlug.useQuery({
    slug: courseSlug,
  })

  useEffect(() => {
    if (error) {
      // If fetching fails, redirect to courses page
      router.push('/courses')
    }

    if (course ?? error) {
      setIsLoading(false)
    }
  }, [course, error, router])

  if (isLoading) {
    return (
      <div className="w-full bg-gray-50 px-4 py-6 pb-16 dark:bg-gray-800 md:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-center">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return null // Will be handled by error redirect in useEffect
  }

  // Check if there are any quizzes
  if (course.quizzes.length === 0) {
    return (
      <div className="w-full bg-gray-50 px-4 py-6 pb-16 dark:bg-gray-800 md:px-8">
        <div className="container mx-auto max-w-5xl">
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

          <div className="rounded-lg bg-white p-6 shadow-md dark:border dark:border-gray-700 dark:bg-gray-800">
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
      </div>
    )
  }

  // In a real implementation, you would fetch the specific quiz data
  // For now, we'll just show a placeholder
  return (
    <div className="w-full bg-gray-50 px-4 py-6 pb-16 dark:bg-gray-800 md:px-8">
      <div className="container mx-auto max-w-5xl">
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

        <div className="rounded-lg bg-white p-6 shadow-md dark:border dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
            Quiz: {course.quizzes[0]?.name ?? 'Course Quiz'}
          </h2>

          <div className="prose max-w-none dark:prose-invert">
            <p>
              {course.quizzes[0]?.description ??
                'Test your knowledge with this quiz.'}
            </p>
            <p>The interactive quiz feature is coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
