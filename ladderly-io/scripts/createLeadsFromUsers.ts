// run like `node --experimental-strip-types scripts/createLeadsFromUsers.ts`

import { fileURLToPath } from 'url'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure dotenv
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function createLeadsFromUsers(): Promise<void> {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
    })

    console.log(`Found ${users.length} users to process`)

    let createdCount = 0
    let updatedCount = 0
    let skippedCount = 0

    // Process each user
    for (const user of users) {
      // Check if a lead with this email already exists
      const existingLead = await prisma.lead.findUnique({
        where: { email: user.email },
      })

      if (existingLead) {
        // Update the lead to ensure it's connected to the user
        if (existingLead.userId !== user.id) {
          await prisma.lead.update({
            where: { id: existingLead.id },
            data: { userId: user.id },
          })
          updatedCount++
        } else {
          skippedCount++
        }
        continue
      }

      // Create a new lead for this user
      await prisma.lead.create({
        data: {
          email: user.email,
          userId: user.id,
          isRecruiter: false,
          hasOptOutMarketing: false,
          hasOptOutFeatureUpdates: false,
          hasOptOutEventAnnouncements: false,
          hasOptOutNewsletterAndBlog: false,
        },
      })
      createdCount++
    }

    console.log('\nLead creation summary:')
    console.log(`- Created: ${createdCount} new leads`)
    console.log(`- Updated: ${updatedCount} existing leads`)
    console.log(`- Skipped: ${skippedCount} already connected leads`)
    console.log(`- Total processed: ${users.length} users`)
  } catch (error) {
    console.error('Error creating leads:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createLeadsFromUsers().catch((error: Error) => {
  console.error('Script failed:', error)
  process.exit(1)
})
