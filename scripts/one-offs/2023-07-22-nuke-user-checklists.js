const path = require("path")

require("dotenv").config({ path: path.resolve(__dirname, "../../.env.local") })

const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function executeOneOff() {
  await prisma.userChecklist.deleteMany()
  console.log("One-off script completed!")
}

executeOneOff()
  .catch((e) => {
    console.error(`Failed to execute one-off script. Error: ${e.message}`)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
