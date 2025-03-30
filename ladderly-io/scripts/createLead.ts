// run like `node --experimental-strip-types scripts/createLead.ts`

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

async function createLead(): Promise<void> {
  try {
    const email = 'john@ladderly.io'

    // Check if a lead with this email already exists
    const existingLead = await prisma.lead.findUnique({
      where: { email },
    })

    if (existingLead) {
      console.log(`Lead with email ${email} already exists!`)
      return
    }

    // Check if a user with this email exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    // Create the lead
    const lead = await prisma.lead.create({
      data: {
        email,
        userId: existingUser?.id,
        isRecruiter: false,
        hasOptOutMarketing: false,
        hasOptOutFeatureUpdates: false,
        hasOptOutEventAnnouncements: false,
        hasOptOutNewsletterAndBlog: false,
      },
    })

    console.log('Lead created successfully:', {
      id: lead.id,
      email: lead.email,
      userId: lead.userId,
    })

    if (existingUser) {
      console.log('Lead was connected to existing user:', {
        userId: existingUser.id,
        email: existingUser.email,
      })
    }
  } catch (error) {
    console.error('Error creating lead:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createLead().catch((error: Error) => {
  console.error('Script failed:', error)
  process.exit(1)
})
