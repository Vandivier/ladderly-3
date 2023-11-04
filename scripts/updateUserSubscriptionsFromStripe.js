const path = require("path")
const fs = require("fs")

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") })

const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function updateSubscriptionTiers() {
  const results = {}
  const premiumEmails = process.env.PREMIUM_EMAILS.split(",")
  const pWYC_Emails = process.env.PWYC_EMAILS.split(",")
  const data = JSON.parse(fs.readFileSync("./stripe_payments.json", "utf-8"))

  data.forEach((record) => {
    // Remove non-digit and non-period characters from the amount string
    // eg currency symbols and commas
    const amountPaid = parseFloat(record["amount"].replace(/[^0-9.]/g, ""))
    const email = record["email"]
    if (!results[email]) {
      results[email] = 0
    }
    results[email] += amountPaid
  })

  // Update each user's subscription tier
  for (const email in results) {
    let tier
    const totalPaid = results[email]

    if (totalPaid >= 30 || premiumEmails.includes(email)) {
      tier = "PREMIUM"
    } else if (totalPaid >= 1 || pWYC_Emails.includes(email)) {
      tier = "PAY_WHAT_YOU_CAN"
    } else {
      tier = "FREE"
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { emailStripe: email }],
      },
    })
    if (!user) {
      console.log(`User not found: ${email}`)
      continue
    }

    await prisma.subscription.updateMany({
      where: { userId: user.id },
      data: { tier },
    })
  }

  console.log("Subscription tiers updated.")
}

updateSubscriptionTiers().catch(console.error)
