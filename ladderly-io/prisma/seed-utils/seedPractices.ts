import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Define __dirname since this is an ES module
const __dirname = process.cwd() + '/prisma'

export async function seedPractices(prisma: PrismaClient) {
  console.log('Seeding journal practice items...')

  // Read practice items from JSON file
  const practicesPath = path.join(__dirname, 'seeds/practices.json')
  const practicesData = JSON.parse(fs.readFileSync(practicesPath, 'utf8'))

  // Count existing practice items to avoid duplicates
  const existingCount = await prisma.journalPractice.count()

  if (existingCount > 0) {
    console.log(
      `Found ${existingCount} existing practice items. Skipping seed.`,
    )
    return
  }

  // Create practice items
  const practices = await Promise.all(
    practicesData.map(async (practice: any) => {
      return prisma.journalPractice.create({
        data: {
          name: practice.name,
          description: practice.description,
          category: practice.category,
        },
      })
    }),
  )

  console.log(`Created ${practices.length} practice items.`)
  return practices
}
