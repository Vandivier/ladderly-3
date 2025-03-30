// run like `node --experimental-strip-types scripts/createLeadsFromTextList.ts`

import { fileURLToPath } from 'url'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import fs from 'fs/promises'

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure dotenv
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function createLeadsFromTextList(): Promise<void> {
  try {
    // Read the email list file
    const filePath = path.resolve(__dirname, './data/lead_list.txt')
    const fileContent = await fs.readFile(filePath, 'utf-8')

    // Split into lines and clean up
    const emails = fileContent
      .split('\n')
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email && email.includes('@')) // Filter out empty lines and invalid emails

    console.log(`Found ${emails.length} email addresses to process`)

    let createdCount = 0
    let skippedCount = 0
    let errorCount = 0

    // Process each email
    for (const email of emails) {
      try {
        // Check if a lead with this email already exists
        const existingLead = await prisma.lead.findUnique({
          where: { email },
        })

        if (existingLead) {
          skippedCount++
          continue
        }

        // Check if a user with this email exists
        const existingUser = await prisma.user.findUnique({
          where: { email },
        })

        // Create a new lead
        await prisma.lead.create({
          data: {
            email,
            userId: existingUser?.id ?? null,
            isRecruiter: false,
            hasOptOutMarketing: false,
            hasOptOutFeatureUpdates: false,
            hasOptOutEventAnnouncements: false,
            hasOptOutNewsletterAndBlog: false,
          },
        })
        createdCount++

        if (existingUser) {
          console.log(`Created lead for existing user: ${email}`)
        } else {
          console.log(`Created lead for new email: ${email}`)
        }
      } catch (error) {
        console.error(`Error processing email ${email}:`, error)
        errorCount++
      }
    }

    console.log('\nLead creation summary:')
    console.log(`- Created: ${createdCount} new leads`)
    console.log(`- Skipped: ${skippedCount} existing leads`)
    console.log(`- Errors: ${errorCount} failed attempts`)
    console.log(`- Total processed: ${emails.length} email addresses`)
  } catch (error) {
    console.error('Error reading file or creating leads:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createLeadsFromTextList().catch((error: Error) => {
  console.error('Script failed:', error)
  process.exit(1)
})
