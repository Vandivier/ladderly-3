'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '~/trpc/react'

interface QuizContentProps {
  courseSlug: string
}

interface FlashcardQuestion {
  id: number
  question: string
  correctAnswer: string
  distractors: string[]
  explanation: string | null
}

interface QuizInfo {
  quiz: {
    id: number
    name: string
    description: string | null
    timeLimit: number | null
    flashCardDeck: {
      id: number
      description: string | null
      name: string
      createdAt: Date
      updatedAt: Date
      courseId: number | null
    }
    course: {
      id: number
      title: string
      description: string
      createdAt: Date
      updatedAt: Date
      slug: string
    } | null
    createdAt: Date
    updatedAt: Date
    courseId: number | null
    flashCardDeckId: number
  }
  latestAttempt: {
    id: number
    score: number
    passed: boolean
    createdAt: Date
    quizId: number
    userId: number
  } | null
  cooldownEndsAt: Date | null
  canAttempt: boolean
}

interface QuizData {
  quizId: number
  quizName: string
  timeLimit: number | null
  flashcards: FlashcardQuestion[]
}

interface QuizResult {
  id: number
  createdAt: Date
  score: number
  passed: boolean
  user?: {
    id: number
  }
  quiz: {
    id: number
    description: string | null
    name: string
    createdAt: Date
    updatedAt: Date
    courseId: number | null
    flashCardDeckId: number
    timeLimit: number | null
  }
  quizId: number
  userId: number
}

export default function QuizContent({ courseSlug }: QuizContentProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [quizId, setQuizId] = useState<number | null>(null)
  const [quizStarted, setQuizStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [, setSelectedAnswer] = useState<Record<number, string>>({})
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [, setStartTime] = useState<Date | null>(null)
  const [questionOptions, setQuestionOptions] = useState<string[][]>([])

  // Get course data
  const { data: course, error: courseError } = api.course.getBySlug.useQuery({
    slug: courseSlug,
  })

  // Find the quiz for this course
  useEffect(() => {
    if (course?.quizzes && course.quizzes.length > 0) {
      setQuizId(course.quizzes[0]?.id ?? null)
    }
  }, [course])

  // Get quiz info including cooldown status
  const { data: quizInfo, isLoading: isQuizInfoLoading } =
    api.quiz.getQuizInfo.useQuery<QuizInfo>(
      {
        courseSlug,
        quizId: quizId ?? 0,
      },
      {
        enabled: quizId !== null,
        refetchInterval: false, // Don't auto-refetch
      },
    )

  // Get flashcards for the quiz
  const { data: quizData, isLoading: isQuizDataLoading } =
    api.quiz.getQuizFlashcards.useQuery<QuizData>(
      { quizId: quizId ?? 0 },
      {
        enabled: quizId !== null && quizStarted,
        staleTime: Infinity, // Don't refetch during an active quiz
      },
    )

  // Quiz submission mutation
  const submitQuizMutation = api.quiz.submitQuizAttempt.useMutation({
    onSuccess: () => {
      router.refresh()
    },
  })

  // End the quiz and calculate score
  const endQuiz = useCallback(
    (_earlyExit: boolean) => {
      setQuizCompleted(true)

      // Always calculate score based on total questions (50)
      const totalQuestions = 50
      const calculatedScore = Math.round(
        (correctAnswers / totalQuestions) * 100,
      )
      setScore(calculatedScore)

      // Submit quiz result
      if (quizId) {
        submitQuizMutation.mutate({
          quizId,
          score: calculatedScore,
        })
      }
    },
    [correctAnswers, quizId, submitQuizMutation],
  )

  // Set up quiz timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (quizStarted && quizData?.timeLimit && !quizCompleted) {
      const duration = quizData.timeLimit
      setTimeLeft(duration)

      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev && prev > 0) {
            return prev - 1
          } else {
            // Time&apos;s up
            endQuiz(true)
            return 0
          }
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [quizStarted, quizData, quizCompleted, endQuiz])

  useEffect(() => {
    if (!isQuizInfoLoading && !isQuizDataLoading && !courseError) {
      setIsLoading(false)
    }
  }, [isQuizInfoLoading, isQuizDataLoading, courseError])

  // Format time limit in seconds to a readable format
  const formatTimeLimit = (seconds: number | null): string => {
    if (!seconds) return 'No time limit'

    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      const remainingMinutes = minutes % 60
      return `${hours} hour${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` and ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}` : ''}`
    }

    return `${minutes} minute${minutes > 1 ? 's' : ''}`
  }

  // Format relative time (e.g., "2 hours ago")
  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    let interval = Math.floor(seconds / 31536000)
    if (interval > 1) return `${interval} years ago`
    if (interval === 1) return 'a year ago'

    interval = Math.floor(seconds / 2592000)
    if (interval > 1) return `${interval} months ago`
    if (interval === 1) return 'a month ago'

    interval = Math.floor(seconds / 86400)
    if (interval > 1) return `${interval} days ago`
    if (interval === 1) return 'a day ago'

    interval = Math.floor(seconds / 3600)
    if (interval > 1) return `${interval} hours ago`
    if (interval === 1) return 'an hour ago'

    interval = Math.floor(seconds / 60)
    if (interval > 1) return `${interval} minutes ago`
    if (interval === 1) return 'a minute ago'

    return 'just now'
  }

  // Format time remaining
  const formatTimeRemaining = (date: Date | null): string => {
    if (!date) return 'now'
    const now = new Date()
    const seconds = Math.floor((date.getTime() - now.getTime()) / 1000)

    if (seconds <= 0) return 'now'

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`
    }

    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  }

  // Handle starting the quiz
  const startQuiz = () => {
    setQuizStarted(true)
    setCurrentQuestion(0)
    setSelectedAnswer({})
    setCorrectAnswers(0)
    setQuizCompleted(false)
    setScore(0)
    setStartTime(new Date())
    setQuestionOptions([])
  }

  // Generate stable random options for each question
  useEffect(() => {
    if (quizStarted && quizData && !quizCompleted) {
      // Generate options array for all questions only once when quiz starts
      if (questionOptions.length === 0) {
        const newOptions = quizData.flashcards.map(
          (card: FlashcardQuestion) => {
            const options = [
              card.correctAnswer,
              ...card.distractors.slice(0, 3),
            ].sort(() => Math.random() - 0.5)
            return options
          },
        )
        setQuestionOptions(newOptions)
      }
    }
  }, [quizStarted, quizData, quizCompleted, questionOptions.length])

  // Handle answering a question
  const handleAnswer = (answer: string) => {
    const flashcard = quizData?.flashcards[currentQuestion]
    const isCorrect = flashcard?.correctAnswer === answer
    const currentQuestionIndex = currentQuestion

    // Update answers and score
    setSelectedAnswer((prev) => ({ ...prev, [currentQuestionIndex]: answer }))
    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1)
    }

    // Check for auto-fail (11 wrong answers)
    if (!isCorrect && currentQuestionIndex + 1 - correctAnswers >= 11) {
      endQuiz(true)
      return
    }

    // Move to next question or end quiz
    if (currentQuestionIndex < (quizData?.flashcards.length ?? 0) - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      endQuiz(false)
    }
  }

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

  if (!course || courseError) {
    return null // Will be handled by error redirect
  }

  // Check if there are any quizzes
  if (!quizId || course.quizzes.length === 0) {
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

  // If quiz is completed, show results
  if (quizStarted && quizCompleted) {
    const passed = score >= 80
    const perfect = score === 100
    const latestQuizResult: QuizResult | null = submitQuizMutation.data ?? null

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
            Quiz Results
          </h1>

          <div className="rounded-lg bg-white p-6 shadow-md dark:border dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-6 text-center">
              <div
                className={`mb-2 text-4xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}
              >
                {score}%
              </div>
              <div className="text-xl">
                {perfect && (
                  <div className="text-yellow-500">
                    Perfect Score! Congratulations!
                  </div>
                )}
                {passed && !perfect && (
                  <div className="text-green-600">Quiz Passed!</div>
                )}
                {!passed && <div className="text-red-600">Quiz Failed</div>}
              </div>
              <div className="mt-2 text-gray-600">
                You got {correctAnswers} out of 50 questions correct.
              </div>
            </div>

            {passed && latestQuizResult?.user && (
              <div className="mb-8 rounded-lg bg-green-50 p-4 dark:bg-green-900/30">
                <h3 className="mb-2 font-semibold text-green-800 dark:text-green-200">
                  Certificate Awarded
                </h3>
                <p className="mb-4 text-green-700 dark:text-green-300">
                  Congratulations! You{"'"}ve earned a certificate for passing
                  this quiz.
                  {perfect && ' You achieved a perfect score with honors!'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white">
                    Certificate Earned
                  </div>
                  <Link
                    href={`/community/${latestQuizResult.user.id}/certificates/${latestQuizResult.id}`}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    View Certificate
                  </Link>
                </div>
              </div>
            )}

            {!passed && (
              <div className="mb-8 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/40">
                <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
                  Study Recommendation
                </h3>
                <p className="text-blue-700 dark:text-blue-300">
                  We recommend reviewing the flashcards to improve your
                  understanding before attempting the quiz again. According to
                  the course guidelines, you must wait 24 hours before trying
                  again.
                </p>
                <Link
                  href={`/courses/${course.slug}/flashcards`}
                  className="mt-3 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Review Flashcards
                </Link>
              </div>
            )}

            <Link
              href={`/courses/${course.slug}/quiz`}
              className="block w-full rounded-md bg-gray-200 px-4 py-2 text-center font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Return to Quiz Page
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // If quiz is in progress, show quiz interface
  if (quizStarted && quizData && !quizCompleted) {
    const currentCard = quizData.flashcards[currentQuestion]

    // Add check for currentCard
    if (!currentCard) {
      // Handle case where currentCard might be undefined briefly
      // Could show a loading state or just return null/empty div
      return <div className="p-4 text-center">Loading question...</div>
    }

    // Use pre-randomized options instead of randomizing on every render
    const options =
      questionOptions[currentQuestion] ??
      // Fallback in case options aren't ready yet - use stable order
      [currentCard.correctAnswer, ...currentCard.distractors.slice(0, 3)].sort()

    return (
      <div className="w-full bg-gray-50 px-4 py-6 pb-16 dark:bg-gray-800 md:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-md bg-white px-4 py-2 font-semibold text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white">
              Question {currentQuestion + 1} of {quizData.flashcards.length}
            </div>
            {timeLeft !== null && (
              <div className="rounded-md bg-white px-4 py-2 font-mono font-semibold text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white">
                <span className="inline-flex items-center text-red-600 dark:text-red-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-1 size-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Time Remaining: {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md dark:border dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
              {currentCard.question}
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className="rounded-lg border border-gray-300 bg-gray-50 p-4 text-left hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => endQuiz(true)}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              >
                End Quiz Early
              </button>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Correct: {correctAnswers}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Incorrect: {currentQuestion - correctAnswers}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default quiz info screen
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

        {quizInfo && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-md dark:border dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
              {quizInfo.quiz.name}
            </h2>

            <p className="mb-4 text-gray-700 dark:text-gray-300">
              {quizInfo.quiz.description ??
                `Test your knowledge of ${course.title} concepts with this quiz.`}
            </p>

            <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/40">
              <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
                Quiz Guidelines
              </h3>
              <ul className="list-inside list-disc text-blue-700 dark:text-blue-300">
                <li>
                  This quiz consists of 50 questions drawn randomly from the
                  course flashcards.
                </li>
                <li>You need to score at least 80% to pass the quiz.</li>
                <li>
                  A perfect score of 100% will earn you a pass with honors.
                </li>
                <li>
                  Time limit:{' '}
                  <span className="font-medium">
                    {formatTimeLimit(quizInfo.quiz.timeLimit)}
                  </span>
                  .
                </li>
                <li>
                  If you get 11 questions wrong, the quiz will end
                  automatically.
                </li>
                <li>
                  If you fail, you must wait 24 hours before attempting again.
                </li>
                <li>
                  We recommend practicing with the flashcards before taking the
                  quiz.
                </li>
              </ul>
              <Link
                href={`/courses/${course.slug}/flashcards`}
                className="mt-3 inline-block text-blue-600 hover:underline dark:text-blue-400"
              >
                Practice with Flashcards →
              </Link>
            </div>

            {quizInfo.latestAttempt && (
              <div className="mb-6">
                <h3 className="mb-2 font-semibold text-gray-800 dark:text-white">
                  Your Last Attempt
                </h3>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <div className="mb-1">
                    <span className="font-medium">Score:</span>{' '}
                    <span
                      className={
                        quizInfo.latestAttempt.passed
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {quizInfo.latestAttempt.score}%
                    </span>{' '}
                    <span className="text-gray-600 dark:text-gray-400">
                      ({quizInfo.latestAttempt.passed ? 'Passed' : 'Failed'})
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Attempted {formatTimeAgo(quizInfo.latestAttempt.createdAt)}{' '}
                    ago
                  </div>
                </div>
              </div>
            )}

            {!quizInfo.canAttempt && quizInfo.cooldownEndsAt && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 dark:bg-red-900/40">
                <h3 className="mb-2 font-semibold text-red-800 dark:text-red-200">
                  Cooldown Period Active
                </h3>
                <p className="text-red-700 dark:text-red-300">
                  You need to wait{' '}
                  {formatTimeRemaining(quizInfo.cooldownEndsAt)} before you can
                  attempt this quiz again. Please use this time to review the
                  flashcards and improve your understanding of the material.
                </p>
              </div>
            )}

            <button
              onClick={startQuiz}
              disabled={!quizInfo.canAttempt}
              className={`w-full rounded-md px-4 py-3 font-medium ${
                quizInfo.canAttempt
                  ? 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
                  : 'cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              Start Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
