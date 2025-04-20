import * as fs from 'fs'
import * as path from 'path'
import { db } from '../../src/server/db'
import { ContentType } from '@prisma/client'

interface CourseContentItem {
  title: string
  description?: string
  contentUrl?: string
  contentType: ContentType
  order: number
}

interface CourseSeedData {
  slug: string
  title: string
  description: string
  contentItems: CourseContentItem[]
}

export async function seedCourses(): Promise<void> {
  try {
    console.log('Seeding courses...')

    // Get the current working directory
    const __dirname = process.cwd() + '/prisma'

    // Read the JSON file
    const filePath = path.resolve(__dirname, './seeds/courses.json')

    if (!fs.existsSync(filePath)) {
      console.warn(`File ${filePath} does not exist. Skipping course seeding.`)
      return
    }

    const rawData = fs.readFileSync(filePath)
    const courses = JSON.parse(rawData.toString()) as CourseSeedData[]

    for (const courseData of courses) {
      // Check if course already exists
      const existingCourse = await db.course.findUnique({
        where: { slug: courseData.slug },
      })

      if (existingCourse) {
        console.log(
          `Course with slug ${courseData.slug} already exists. Skipping.`,
        )
        continue
      }

      // Create the course with its content items
      console.log(`Creating course: ${courseData.title}`)
      await db.course.create({
        data: {
          slug: courseData.slug,
          title: courseData.title,
          description: courseData.description,
          contentItems: {
            create: courseData.contentItems.map((item) => ({
              title: item.title,
              description: item.description,
              contentUrl: item.contentUrl,
              contentType: item.contentType,
              order: item.order,
            })),
          },
        },
      })
    }

    console.log('Course seeding completed.')
  } catch (error) {
    console.error('Error seeding courses:', error)
  }
}
