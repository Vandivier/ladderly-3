'use client'

import { useState, useEffect } from 'react'
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
  }
  latestAttempt: {
    id: number
    score: number
    passed: boolean
    createdAt: string
  } | null
  cooldownEndsAt: string | null
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
  createdAt: string
  score: number
  passed: boolean
}

export default function QuizContent({ courseSlug }: QuizContentProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [quizId, setQuizId] = useState<number | null>(null)
  const [quizStarted, setQuizStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)

  // Get course data
  const { data: course, error: courseError } = api.course.getBySlug.useQuery({
    slug: courseSlug,
  })

  // Find the quiz for this course
  useEffect(() => {
    if (course?.quizzes && course.quizzes.length > 0) {
      setQuizId(course.quizzes[0]?.id || null)
    }
  }, [course])

  // Get quiz info including cooldown status
  const { data: quizInfo, isLoading: isQuizInfoLoading } =
    api.quiz.getQuizInfo.useQuery<QuizInfo>(
      {
        courseSlug,
        quizId: quizId || 0,
      },
      {
        enabled: quizId !== null,
        refetchInterval: false, // Don't auto-refetch
      },
    )

  // Get flashcards for the quiz
  const { data: quizData, isLoading: isQuizDataLoading } =
    api.quiz.getQuizFlashcards.useQuery<QuizData>(
      { quizId: quizId || 0 },
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

  // Quiz history
  const { data: quizHistory } = api.quiz.getUserQuizHistory.useQuery<
    QuizResult[]
  >({ quizId: quizId || 0 }, { enabled: quizId !== null && !quizStarted })

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
            // Time's up
            endQuiz(true)
            return 0
          }
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [quizStarted, quizData, quizCompleted])

  useEffect(() => {
    if (!isQuizInfoLoading && !isQuizDataLoading && !courseError) {
      setIsLoading(false)
    }
  }, [isQuizInfoLoading, isQuizDataLoading, courseError])

  // Format relative time (e.g., "2 hours ago")
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
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
  const formatTimeRemaining = (dateString: string): string => {
    const date = new Date(dateString)
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
    setAnswers({})
    setCorrectAnswers(0)
    setQuizCompleted(false)
    setScore(0)
    setStartTime(new Date())
  }

  // Handle answering a question
  const handleAnswer = (answer: string) => {
    const flashcard = quizData?.flashcards[currentQuestion]
    const isCorrect = flashcard && flashcard.correctAnswer === answer

    // Update answers and score
    setAnswers((prev) => ({ ...prev, [currentQuestion]: answer }))
    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1)
    }

    // Check for auto-fail (11 wrong answers)
    if (!isCorrect && currentQuestion + 1 - correctAnswers >= 11) {
      endQuiz(true)
      return
    }

    // Move to next question or end quiz
    if (currentQuestion < (quizData?.flashcards.length || 0) - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      endQuiz(false)
    }
  }

  // End the quiz and calculate score
  const endQuiz = (earlyExit: boolean) => {
    setQuizCompleted(true)
    setEndTime(new Date())
    const totalQuestions = earlyExit
      ? currentQuestion + 1
      : quizData?.flashcards.length || 0
    const calculatedScore = Math.round((correctAnswers / totalQuestions) * 100)
    setScore(calculatedScore)

    // Submit quiz result
    if (quizId) {
      submitQuizMutation.mutate({
        quizId,
        score: calculatedScore,
      })
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
                You got {correctAnswers} out of{' '}
                {quizData?.flashcards.length || 0} questions correct.
              </div>
            </div>

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

            <button
              onClick={() => setQuizStarted(false)}
              className="w-full rounded-md bg-gray-200 px-4 py-2 font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Return to Quiz Page
            </button>
          </div>
        </div>
      </div>
    )
  }

  // If quiz is in progress, show quiz interface
  if (quizStarted && quizData && !quizCompleted) {
    const currentCard = quizData.flashcards[currentQuestion]
    const options = [
      currentCard.correctAnswer,
      ...currentCard.distractors.slice(0, 3),
    ].sort(() => Math.random() - 0.5)

    return (
      <div className="w-full bg-gray-50 px-4 py-6 pb-16 dark:bg-gray-800 md:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              Question {currentQuestion + 1} of {quizData.flashcards.length}
            </div>
            {timeLeft !== null && (
              <div className="font-mono text-lg">
                Time: {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, '0')}
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
              {quizInfo.quiz.description ||
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
              {quizInfo.canAttempt
                ? 'Start Quiz'
                : 'Quiz Unavailable During Cooldown'}
            </button>
          </div>
        )}

        {quizHistory && quizHistory.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow-md dark:border dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
              Your Quiz History
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                  <tr>
                    <th className="border-b p-2 text-left">Date</th>
                    <th className="border-b p-2 text-left">Score</th>
                    <th className="border-b p-2 text-left">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {quizHistory.map((result: QuizResult, index: number) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="p-2">
                        {new Date(result.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-2">{result.score}%</td>
                      <td className="p-2">
                        <span
                          className={
                            result.passed
                              ? 'rounded-full bg-green-100 px-2 py-1 text-sm font-medium text-green-800 dark:bg-green-900/50 dark:text-green-200'
                              : 'rounded-full bg-red-100 px-2 py-1 text-sm font-medium text-red-800 dark:bg-red-900/50 dark:text-red-200'
                          }
                        >
                          {result.passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!quizStarted && !quizCompleted && (
          <div className="mx-auto mb-8 max-w-md rounded-lg bg-blue-50 p-4 shadow-sm">
            <p className="mb-2 text-sm text-gray-700">
              This quiz will test your knowledge with multiple-choice questions.
              Select the answer you think is correct and submit your response.
              You'll receive immediate feedback on your answers and a final
              score at the end of the quiz.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
