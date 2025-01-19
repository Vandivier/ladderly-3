const path = require('path')
const fs = require('fs')

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateSubscriptionTiers() {
  const premiumEmails = process.env.PREMIUM_EMAILS.split(',')
  const pWYC_Emails = process.env.PWYC_EMAILS.split(',')
  const data = JSON.parse(fs.readFileSync('./stripe_payments.json', 'utf-8'))
  const subscriptionType = 'ACCOUNT_PLAN'

  for (const record of data) {
    const amountPaid = parseFloat(record['amount'].replace(/[^0-9.]/g, ''))
    const email = record['email'].toLowerCase()
    const contributedAt = new Date(record['date'])
    const transactionId = record['transactionId'] || null

    // Find or create user based on email or emailStripe
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { emailBackup: email }, { emailStripe: email }],
      },
    })

    if (!user) {
      console.log(`User not found: ${email}`)
      continue
    }

    // Fetch or create the subscription
    let subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        type: subscriptionType,
      },
    })

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          type: subscriptionType,
        },
      })
    }

    // Upsert contribution record
    await prisma.contribution.upsert({
      where: {
        contributedAt_userId: {
          contributedAt: contributedAt,
          userId: user.id,
        },
      },
      update: {
        amount: amountPaid,
        stripeTransactionId: transactionId,
      },
      create: {
        amount: amountPaid,
        stripeTransactionId: transactionId,
        contributedAt: contributedAt,
        type: 'ONE_TIME',
        user: { connect: { id: user.id } },
        subscription: { connect: { id: subscription.id } },
      },
    })

    // Compute total contributions for the user
    const totalAmountContributed = await prisma.contribution.aggregate({
      where: {
        userId: user.id,
      },
      _sum: {
        amount: true,
      },
    })

    // Update user's total contributions
    await prisma.user.update({
      where: {
        id: user.id,
      },
    })

    // Determine subscription tier
    let tier
    if (
      totalAmountContributed._sum.amount >= 30 ||
      premiumEmails.includes(email)
    ) {
      tier = 'PREMIUM'
    } else if (
      totalAmountContributed._sum.amount >= 1 ||
      pWYC_Emails.includes(email)
    ) {
      tier = 'PAY_WHAT_YOU_CAN'
    } else {
      tier = 'FREE'
    }

    // Update user's subscription tier
    await prisma.subscription.update({
      where: {
        userId_type: {
          userId: user.id,
          type: subscriptionType,
        },
      },
      data: { tier },
    })
  }

  console.log('Subscription tiers and contributions updated.')
}

updateSubscriptionTiers().catch(console.error)
