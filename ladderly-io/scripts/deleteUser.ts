// This script deletes a user and related entities like subscription
// by userId or email
// run like `node --experimental-strip-types scripts/deleteUser.ts --email foobar@example.com`
// or `node --experimental-strip-types scripts/deleteUser.ts --userId 123`

import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'
import { PrismaClient, type User } from '@prisma/client'

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
config({ path: path.resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

interface DeleteUserParams {
  userId?: string
  email?: string
}

const args = process.argv.slice(2)

if (
  args.length !== 2 ||
  (!args.includes('--userId') && !args.includes('--email'))
) {
  console.error(
    'Please provide exactly one flag: --userId or --email followed by the respective value.',
  )
  process.exit(1)
}

let userId: string | undefined
let email: string | undefined

if (args.includes('--userId')) {
  userId = args[args.indexOf('--userId') + 1]
  if (!/^\d+$/.test(userId)) {
    console.error('Invalid userId provided.')
    process.exit(1)
  }
} else if (args.includes('--email')) {
  email = args[args.indexOf('--email') + 1]
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('Invalid email provided.')
    process.exit(1)
  }
}

const deleteUser = async ({ userId, email }: DeleteUserParams) => {
  try {
    let user: User | null = null
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: parseInt(userId, 10) },
      })
    } else if (email) {
      user = await prisma.user.findUnique({
        where: { email },
      })
    }

    if (!user) {
      console.error('User not found.')
      process.exit(1)
    }

    const userIdToDelete = user.id

    // Delete related UserChecklistItems first to avoid foreign key constraints
    await prisma.userChecklistItem.deleteMany({
      where: { userId: userIdToDelete },
    })
    console.log(`Deleted userChecklistItem entries for user ${userIdToDelete}`)

    // Delete user-related entities
    const relatedEntities = [
      { model: 'userChecklist', relation: 'userId' },
      { model: 'subscription', relation: 'userId' },
      { model: 'session', relation: 'userId' },
      { model: 'token', relation: 'userId' },
      { model: 'transaction', relation: 'userId' },
      { model: 'quizResult', relation: 'userId' },
      { model: 'contribution', relation: 'userId' },
    ] as const

    for (const entity of relatedEntities) {
      const model = prisma[entity.model] as {
        deleteMany: (args: {
          where: Record<string, number>
        }) => Promise<unknown>
      }
      if (model?.deleteMany) {
        await model.deleteMany({
          where: { [entity.relation]: userIdToDelete },
        })
        console.log(
          `Deleted ${entity.model} entries for user ${userIdToDelete}`,
        )
      } else {
        console.log(`No delete method found for ${entity.model}`)
      }
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: userIdToDelete },
    })

    console.log(`Deleted user ${userIdToDelete}`)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      const prismaError = error as Error & { meta?: { cause?: string } }
      console.log(`Entity not found: ${prismaError.meta?.cause}`)
    } else {
      console.error('An error occurred while deleting the user:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

if (userId) {
  deleteUser({ userId })
} else if (email) {
  deleteUser({ email })
}
