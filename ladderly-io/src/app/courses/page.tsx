import { Suspense } from 'react'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { CourseListComponent } from './CourseListComponent'

export default async function CoursesPage() {
  return (
    <LadderlyPageWrapper authenticate requirePremium>
      <Suspense fallback={<div>Loading...</div>}>
        <CourseListComponent />
      </Suspense>
    </LadderlyPageWrapper>
  )
}
