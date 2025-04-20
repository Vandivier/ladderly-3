import { Suspense } from 'react'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { CourseListComponent } from './CourseListComponent'

export const metadata = {
  title: 'Courses - Ladderly',
  description:
    "Explore Ladderly's courses on Time Management, Professional Communication, and Front End Development.",
}

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

export default function CoursesPage() {
  return (
    <LadderlyPageWrapper>
      <Suspense fallback={<div>Loading...</div>}>
        <CourseListComponent courses={courses} />
      </Suspense>
    </LadderlyPageWrapper>
  )
}
