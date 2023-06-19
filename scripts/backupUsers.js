const path = require("path")

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") })

const { PrismaClient } = require("@prisma/client")
const fs = require("fs-extra")

const prisma = new PrismaClient()

async function backupUsers() {
  const users = await prisma.user.findMany()
  await fs.writeJson("./db/bak.users.json", users)
  console.log("Backup completed!")
}

backupUsers()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
