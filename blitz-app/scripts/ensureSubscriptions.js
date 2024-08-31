/*

To use this script for a dry run:
node scripts/ensureSubscriptions.js --dry-run --premium "email1@example.com,email2@example.com"

To actually create/update subscriptions:
node scripts/ensureSubscriptions.js --premium "email1@example.com,email2@example.com"

Key features:
1. Premium Email Handling: Processes premium emails differently, ensuring they always have a PREMIUM subscription.
2. Dry Run Mode: Allows you to see what changes would be made without actually making them.
3. Detailed Logging

*/

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function ensureSubscriptions(dryRun = false, premiumEmails = []) {
  console.log(`Running in ${dryRun ? 'dry-run' : 'live'} mode`)
  console.log(`Premium emails: ${premiumEmails.join(', ')}`)

  try {
    // Fetch all users
    const users = await prisma.user.findMany({
      include: {
        subscriptions: {
          where: {
            type: 'ACCOUNT_PLAN',
          },
        },
      },
    })

    console.log(`Found ${users.length} users`)

    let createdFreeCount = 0
    let createdPremiumCount = 0
    let updatedToPremiumCount = 0
    let skippedCount = 0

    for (const user of users) {
      const isPremium = premiumEmails.includes(user.email.toLowerCase())
      const existingSubscription = user.subscriptions[0]

      if (isPremium) {
        if (existingSubscription) {
          if (existingSubscription.tier !== 'PREMIUM') {
            if (!dryRun) {
              await prisma.subscription.update({
                where: { id: existingSubscription.id },
                data: { tier: 'PREMIUM' },
              })
            }
            console.log(
              `Updated subscription to PREMIUM for user ${user.id} (${user.email})`
            )
            updatedToPremiumCount++
          } else {
            console.log(
              `Skipped user ${user.id} (${user.email}) - already PREMIUM`
            )
            skippedCount++
          }
        } else {
          if (!dryRun) {
            await prisma.subscription.create({
              data: {
                userId: user.id,
                type: 'ACCOUNT_PLAN',
                tier: 'PREMIUM',
              },
            })
          }
          console.log(
            `Created PREMIUM subscription for user ${user.id} (${user.email})`
          )
          createdPremiumCount++
        }
      } else {
        if (!existingSubscription) {
          if (!dryRun) {
            await prisma.subscription.create({
              data: {
                userId: user.id,
                type: 'ACCOUNT_PLAN',
                tier: 'FREE',
              },
            })
          }
          console.log(
            `Created FREE subscription for user ${user.id} (${user.email})`
          )
          createdFreeCount++
        } else {
          console.log(
            `Skipped user ${user.id} (${user.email}) - subscription already exists`
          )
          skippedCount++
        }
      }
    }

    console.log(`
      Operation complete:
      - Total users processed: ${users.length}
      - FREE subscriptions created: ${createdFreeCount}
      - PREMIUM subscriptions created: ${createdPremiumCount}
      - Subscriptions updated to PREMIUM: ${updatedToPremiumCount}
      - Users skipped: ${skippedCount}
    `)
  } catch (error) {
    console.error('An error occurred:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const premiumIndex = args.indexOf('--premium')
const premiumEmails =
  premiumIndex !== -1
    ? args[premiumIndex + 1]
        .split(',')
        .map((email) => email.trim().toLowerCase())
    : []

ensureSubscriptions(dryRun, premiumEmails).catch(console.error)
