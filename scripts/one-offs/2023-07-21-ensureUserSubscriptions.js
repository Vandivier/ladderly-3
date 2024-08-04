const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') })

const { PrismaClient, PaymentTierEnum } = require('@prisma/client')

const prisma = new PrismaClient()

async function ensureUserSubscriptions() {
  const users = await prisma.user.findMany({
    include: { subscriptions: true },
  })

  for (let user of users) {
    if (user.subscriptions.length === 0) {
      try {
        await prisma.subscription.create({
          data: {
            user: { connect: { id: user.id } },
            tier: PaymentTierEnum.FREE,
            type: 'ACCOUNT_PLAN',
            createdAt: new Date(),
          },
        })
        console.log(`Created FREE subscription for user ${user.id}`)
      } catch (error) {
        console.error(
          `Failed to create FREE subscription for user ${user.id}. Error: ${error.message}`
        )
        process.exit(1)
      }
    }
  }

  console.log('Subscription verification completed!')
}

ensureUserSubscriptions()
  .catch((e) => {
    console.error(
      `Failed to ensure subscriptions for all users. Error: ${e.message}`
    )
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
