import { Prisma, VotableType } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { db } from '../../src/server/db'

// Use process.cwd() instead of import.meta.url
const __dirname = process.cwd() + '/prisma/seed-utils'

type VotableSeedData = {
  type: string
  name: string
  description?: string
  tags?: string[]
  prestigeScore?: number
  voteCount?: number
  registeredUserVotes?: number
  guestVotes?: number
  website?: string
  miscInfo?: Prisma.NullableJsonNullValueInput
}

export const seedVotables = async () => {
  const filePath = path.resolve(__dirname, './votables.json')

  if (!fs.existsSync(filePath)) {
    console.warn(`File ${filePath} does not exist.\nContinuing to seed...`)
    return
  }

  const rawData = fs.readFileSync(filePath)
  const votables: VotableSeedData[] = JSON.parse(rawData.toString())

  for (const votableData of votables) {
    const { type, name, ...optionalData } = votableData

    if (!Object.values(VotableType).includes(type as VotableType)) {
      throw new Error(`Invalid VotableType: ${type}`)
    }

    try {
      // Try to find an existing record
      const existingVotable = await db.votable.findUnique({
        where: {
          type_name: {
            type: type as VotableType,
            name,
          },
        },
      })

      if (existingVotable) {
        // Check if any fields need to be updated
        const updatedFields: Prisma.VotableUpdateInput = {}
        for (const [key, value] of Object.entries(optionalData)) {
          if (existingVotable[key as keyof typeof existingVotable] !== value) {
            updatedFields[key as keyof Prisma.VotableUpdateInput] = value
          }
        }

        // If there are fields to update, perform the update
        if (Object.keys(updatedFields).length > 0) {
          await db.votable.update({
            where: { id: existingVotable.id },
            data: updatedFields,
          })
          console.log(`Updated Votable: ${type} - ${name}`)
        } else {
          console.log(`No updates needed for Votable: ${type} - ${name}`)
        }
      } else {
        // Create a new record if it doesn't exist
        const createData: Prisma.VotableCreateInput = {
          type: type as VotableType,
          name,
          ...optionalData,
          miscInfo: optionalData.miscInfo ?? undefined,
        }
        await db.votable.create({
          data: createData,
        })
        console.log(`Created new Votable: ${type} - ${name}`)
      }
    } catch (error) {
      console.error(`Error processing Votable ${type} - ${name}:`, error)
    }
  }

  console.log('Votables seeded successfully.')
}
