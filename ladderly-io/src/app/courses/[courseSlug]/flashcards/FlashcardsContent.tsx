'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '~/trpc/react'
import { useRouter } from 'next/navigation'

interface FlashcardsContentProps {
  courseSlug: string
}

export default function FlashcardsContent({
  courseSlug,
}: FlashcardsContentProps) {
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

    if (course || error) {
      setIsLoading(false)
    }
  }, [course, error, router])

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  if (!course) {
    return null // Will be handled by error redirect in useEffect
  }

  // Check if there are any flashcard decks
  if (course.flashCardDecks.length === 0) {
    return (
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
          Test your knowledge of {course.title} concepts with these flashcards.
        </p>

        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-700">
          <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
            Flashcards Coming Soon
          </h2>

          <div className="prose max-w-none dark:prose-invert">
            <p>Flashcards for {course.title} are currently being developed.</p>
            <p>
              Check back soon for interactive flashcards to help you master the
              key concepts from this course.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // In a real implementation, you would fetch the specific flashcard deck
  // and display its cards. For now, we'll just show a placeholder
  return (
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
        Test your knowledge of {course.title} concepts with these flashcards.
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
  )
}
