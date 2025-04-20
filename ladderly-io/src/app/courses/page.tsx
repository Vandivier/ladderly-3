import { Suspense } from 'react'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { CourseListComponent } from './CourseListComponent'
import { createCaller } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'

export const metadata = {
  title: 'Courses - Ladderly',
  description:
    "Explore Ladderly's courses on Time Management, Professional Communication, and Front End Development.",
}

// This enables static rendering with dynamic data
export const revalidate = 3600 // revalidate the data at most every hour

export default async function CoursesPage() {
  // Server-side tRPC call to get courses
  const caller = createCaller(
    await createTRPCContext({ headers: new Headers() }),
  )
  const courses = await caller.course.getAll()

  return (
    <LadderlyPageWrapper>
      <Suspense fallback={<div>Loading...</div>}>
        <CourseListComponent courses={courses} />
      </Suspense>
    </LadderlyPageWrapper>
  )
}
