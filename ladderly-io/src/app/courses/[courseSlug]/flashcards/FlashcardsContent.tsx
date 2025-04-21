'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '~/trpc/react'
import { useRouter } from 'next/navigation'

interface FlashcardData {
  question: string
  correctAnswer: string
}

interface FlashcardProps {
  question: string
  answer: string
  isFlipped: boolean
  setIsFlipped: (isFlipped: boolean) => void
  animateFlip: boolean
}

const Flashcard = ({
  question,
  answer,
  isFlipped,
  setIsFlipped,
  animateFlip,
}: FlashcardProps) => {
  return (
    <div
      className="relative h-64 w-full cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative h-full w-full ${animateFlip ? 'transition-transform duration-500' : ''}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front of card (Question) */}
        <div
          className="absolute inset-0 flex h-full w-full flex-col items-center justify-center rounded-lg border border-gray-300 bg-white p-6 shadow-lg dark:border-gray-600 dark:bg-gray-700"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
            Question
          </h3>
          <p className="text-center text-gray-700 dark:text-gray-300">
            {question}
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Click to reveal answer
          </div>
        </div>

        {/* Back of card (Answer) */}
        <div
          className="absolute inset-0 flex h-full w-full flex-col items-center justify-center rounded-lg border border-gray-300 bg-white p-6 shadow-lg dark:border-gray-600 dark:bg-gray-700"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
            Answer
          </h3>
          <p className="text-center text-gray-700 dark:text-gray-300">
            {answer}
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Click to see question
          </div>
        </div>
      </div>
    </div>
  )
}

interface FlashcardsContentProps {
  courseSlug: string
}

export default function FlashcardsContent({
  courseSlug,
}: FlashcardsContentProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [flashcards, setFlashcards] = useState<
    Array<{ question: string; answer: string }>
  >([])
  const [error, setError] = useState<string | null>(null)
  const [isCurrentCardFlipped, setIsCurrentCardFlipped] = useState(false)
  const [manualFlip, setManualFlip] = useState(true)

  // Use React Query from trpc/react to fetch course data
  const { data: course, error: courseError } = api.course.getBySlug.useQuery({
    slug: courseSlug,
  })

  // Fetch the flashcards for the course
  const { data: deckData, isLoading: isDeckLoading } =
    api.course.getFlashCardDeckBySlug.useQuery(
      {
        courseSlug,
        deckId: course?.flashCardDecks[0]?.id ?? 0,
      },
      {
        enabled:
          !!course &&
          course.flashCardDecks.length > 0 &&
          !!course.flashCardDecks[0]?.id,
      },
    )

  // Process deck data when it's available
  useEffect(() => {
    if (deckData?.flashCards) {
      // Transform flashcards data into the format needed for the component
      setFlashcards(
        deckData.flashCards.map((card: FlashcardData) => ({
          question: card.question,
          answer: card.correctAnswer,
        })),
      )
    }
  }, [deckData])

  useEffect(() => {
    if (courseError) {
      // If fetching fails, redirect to courses page
      router.push('/courses')
    }

    if ((course && !isDeckLoading) ?? courseError) {
      setIsLoading(false)
    }
  }, [course, courseError, router, isDeckLoading])

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setManualFlip(false) // Disable animation for navigation
      setIsCurrentCardFlipped(false) // Reset flip state
      setCurrentCardIndex(currentCardIndex + 1)
    }
  }

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setManualFlip(false) // Disable animation for navigation
      setIsCurrentCardFlipped(false) // Reset flip state
      setCurrentCardIndex(currentCardIndex - 1)
    }
  }

  const handleCardFlip = (flipped: boolean) => {
    setManualFlip(true) // Enable animation for manual flips
    setIsCurrentCardFlipped(flipped)
  }

  if (isLoading || isDeckLoading) {
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

  // Check if there are any flashcard decks
  if (course.flashCardDecks.length === 0) {
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
            {course.title} Flashcards
          </h1>

          <p className="mb-8 text-lg text-gray-700 dark:text-gray-300">
            Test your knowledge of {course.title} concepts with these
            flashcards.
          </p>

          <div className="rounded-lg bg-white p-6 shadow-md dark:border dark:border-gray-700 dark:bg-gray-800">
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
      </div>
    )
  }

  // Display the interactive flashcards
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
          {course.title} Flashcards
        </h1>

        <p className="mb-8 text-lg text-gray-700 dark:text-gray-300">
          Test your knowledge of {course.title} concepts with these flashcards.
        </p>

        <div className="rounded-lg bg-white p-6 shadow-md dark:border dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
            Flashcard Deck: {deckData?.name ?? 'Course Flashcards'}
          </h2>

          {flashcards.length > 0 ? (
            <div className="space-y-6">
              <div className="text-sm text-gray-500">
                Card {currentCardIndex + 1} of {flashcards.length}
              </div>

              <div className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                <p>
                  <strong>How to use:</strong> Cards start with questions facing
                  up. Click on a card to flip it and reveal the answer. Click
                  again to return to the question.
                </p>
              </div>

              <Flashcard
                question={flashcards[currentCardIndex]?.question ?? ''}
                answer={flashcards[currentCardIndex]?.answer ?? ''}
                isFlipped={isCurrentCardFlipped}
                setIsFlipped={handleCardFlip}
                animateFlip={manualFlip}
              />

              <div className="mt-6 flex justify-between">
                <button
                  onClick={prevCard}
                  disabled={currentCardIndex === 0}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Previous
                </button>
                <button
                  onClick={nextCard}
                  disabled={currentCardIndex === flashcards.length - 1}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none dark:prose-invert">
              <p>
                {deckData?.description ??
                  'Practice with these flashcards to reinforce your learning.'}
              </p>
              <p>No flashcards found for this deck.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
