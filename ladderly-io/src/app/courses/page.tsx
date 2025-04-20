import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { CourseListComponent } from './CourseListComponent'
import { api } from '~/trpc/server'

export const metadata = {
  title: 'Courses - Ladderly',
  description:
    "Explore Ladderly's courses on Time Management, Professional Communication, and Front End Development.",
}

export default async function CoursesPage() {
  const courses = await api.course.getAll()

  return (
    <LadderlyPageWrapper>
      <CourseListComponent courses={courses} />
    </LadderlyPageWrapper>
  )
}
