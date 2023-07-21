const path = require("path")
const fs = require("fs-extra")
const glob = require("glob")

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") })

const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function restoreUsers() {
  const backupFiles = glob.sync("./db/bak.users.*.json")

  // Sort the files by timestamp descending
  backupFiles.sort((a, b) => {
    const timestampA = a.split(".").slice(-2, -1)[0]
    const timestampB = b.split(".").slice(-2, -1)[0]
    return new Date(timestampB) - new Date(timestampA)
  })

  const mostRecentBackupFile = backupFiles[0]
  const users = await fs.readJson(mostRecentBackupFile)

  for (let user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    })
  }

  console.log("User restoration completed!")
}

restoreUsers()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
