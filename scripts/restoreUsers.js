const path = require("path")

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") })

const { PrismaClient } = require("@prisma/client")
const fs = require("fs-extra")

const prisma = new PrismaClient()

async function restoreUsers() {
  const users = await fs.readJson("./db/bak.users.json")
  for (let user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    })
  }
  console.log("Restoration completed!")
}

restoreUsers()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
