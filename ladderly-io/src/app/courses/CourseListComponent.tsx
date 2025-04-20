'use client'

import Link from 'next/link'
import type { Course } from '@prisma/client'

// Define an extended type that includes the related models
interface CourseWithRelations extends Course {
  contentItems: Array<{
    id: number
    title: string
    description?: string | null
    contentUrl?: string | null
    contentType: string
    order: number
  }>
  flashCardDecks: Array<{
    id: number
    name: string
    description?: string | null
  }>
  quizzes: Array<{
    id: number
    name: string
    description?: string | null
  }>
}

interface CourseListComponentProps {
  courses: CourseWithRelations[]
}

export const CourseListComponent = ({ courses }: CourseListComponentProps) => {
  return (
    <div className="w-full bg-gray-50 px-4 py-6 pb-16 dark:bg-gray-800 md:px-8">
      <div className="container mx-auto max-w-5xl">
        <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
          Available Courses
        </h1>

        <div className="grid gap-6">
          {courses.map((course) => (
            <div
              key={course.slug}
              className="overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-700"
            >
              <div className="p-6">
                <h2 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">
                  {course.title}
                </h2>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  {course.description}
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={{
                      pathname: `/courses/${course.slug}`,
                    }}
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Course Content
                  </Link>

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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
