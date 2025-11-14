/**
 * This script migrates LeetCode problems from JSON files to the database as a Checklist
 * with items. The source information is stored as tags.
 *
 * Run this script with: npx ts-node scripts/migrate-leetcode-to-checklist.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { db } from '../../src/server/db'

// Use process.cwd() instead of import.meta.url
const __dirname = process.cwd() + '/prisma/seed-utils'

interface LeetcodeProblem {
  href: string
  name: string
  source: string | string[]
  patterns?: string[]
  difficulty?: string
}

export const seedLeetcodeChecklist = async () => {
  console.log('Starting seeding of LeetCode problems to Checklist...')
  console.log('Current directory:', process.cwd())

  // Try multiple possible locations for the unified problems JSON file
  const possiblePaths = [
    // Path relative to the project root
    path.resolve(
      process.cwd(),
      'scripts',
      'python',
      'leetcode-problems',
      'unified-leetcode-problems.json',
    ),
    // Path relative to this file
    path.resolve(
      __dirname,
      '..',
      '..',
      'scripts',
      'python',
      'leetcode-problems',
      'unified-leetcode-problems.json',
    ),
    // Path directly from the scripts directory
    path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'scripts',
      'python',
      'leetcode-problems',
      'unified-leetcode-problems.json',
    ),
  ]

  // Find the first path that exists
  let filePath = null as string | null
  for (const potentialPath of possiblePaths) {
    console.log(
      `Checking if LeetCode problems file exists at: ${potentialPath}`,
    )
    if (fs.existsSync(potentialPath)) {
      filePath = potentialPath
      console.log(`Found LeetCode problems file at: ${filePath}`)
      break
    }
  }

  if (!filePath) {
    console.warn(
      `LeetCode problems JSON file not found in any of the searched locations.\nSkipping LeetCode seeding and continuing with other seeds...`,
    )
    return
  }

  // Read the file
  console.log(`Reading LeetCode problems from: ${filePath}`)
  const fileContents = fs.readFileSync(filePath, 'utf-8')
  const problems: LeetcodeProblem[] = JSON.parse(fileContents)
  console.log(`Found ${problems.length} LeetCode problems in the JSON file`)

  // Ensure idempotency: remove ALL existing checklists named "LeetCode Problems"
  const existing = await db.checklist.findMany({
    where: { name: 'LeetCode Problems' },
    select: { id: true },
  })

  if (existing.length > 0) {
    const checklistIds = existing.map((c) => c.id)
    console.log(
      `Found ${existing.length} existing 'LeetCode Problems' checklist(s). Deleting related data...`,
    )

    // Gather userChecklist ids for these checklists
    const userChecklists = await db.userChecklist.findMany({
      where: { checklistId: { in: checklistIds } },
      select: { id: true },
    })
    const userChecklistIds = userChecklists.map((uc) => uc.id)

    await db.$transaction([
      // Delete user checklist items for those user checklists
      db.userChecklistItem.deleteMany({
        where: userChecklistIds.length
          ? { userChecklistId: { in: userChecklistIds } }
          : { id: { in: [] } },
      }),
      // Delete user checklists referencing these checklists
      db.userChecklist.deleteMany({
        where: { checklistId: { in: checklistIds } },
      }),
      // Delete checklist items for these checklists
      db.checklistItem.deleteMany({
        where: { checklistId: { in: checklistIds } },
      }),
      // Finally delete the checklists themselves
      db.checklist.deleteMany({ where: { id: { in: checklistIds } } }),
    ])

    console.log('Deleted existing LeetCode checklists and related records.')
  }

  // Create a new checklist with current content
  const version = new Date().toISOString()

  // Helper to build tags from a problem
  const buildTags = (problem: LeetcodeProblem): string[] => {
    const tags: string[] = []

    // Sources as tags
    const source = problem?.source ?? 'unknown'
    if (Array.isArray(source)) {
      tags.push(...source.map((s) => `source:${s}`))
      if (source.length > 1 && !source.includes('multiple')) {
        tags.push('source:multiple')
      }
    } else if (source) {
      tags.push(`source:${source}`)
    }

    // Patterns as tags
    const patterns = problem?.patterns ?? []
    if (Array.isArray(patterns) && patterns.length > 0) {
      tags.push(...patterns.map((p) => `pattern:${p}`))
    }

    // Difficulty as a tag (e.g., difficulty:Easy|Medium|Hard)
    const difficulty = problem?.difficulty
    if (typeof difficulty === 'string' && difficulty.trim().length > 0) {
      tags.push(`difficulty:${difficulty.trim()}`)
    }

    return Array.from(new Set(tags))
  }

  console.log('Creating fresh LeetCode Problems checklist...')
  const checklist = await db.checklist.create({
    data: {
      name: 'LeetCode Problems',
      version,
      publishedAt: new Date(),
    },
  })

  // Create checklist items for each problem
  let createdCount = 0

  for (let i = 0; i < problems.length; i++) {
    const problem = problems[i]!
    try {
      const tags = buildTags(problem)

      await db.checklistItem.create({
        data: {
          displayIndex: i + 1,
          displayText: problem?.name ?? 'Unknown Problem Name',
          linkUri: problem?.href,
          linkText: 'Solve on LeetCode',
          tags,
          isRequired: false,
          checklistId: checklist.id,
        },
      })

      createdCount++
      if (createdCount % 100 === 0 || i === problems.length - 1) {
        console.log(
          `Created ${createdCount} of ${problems.length} checklist items...`,
        )
      }
    } catch (itemError) {
      console.error(
        `Error creating checklist item for ${problem?.name}:`,
        itemError,
      )
    }
  }

  console.log(
    `Migrated ${createdCount} of ${problems.length} LeetCode problems to ChecklistItems`,
  )

  // Post-seed validation: Ladderly Expanded Kata should have exactly 28 problems
  const KATA_TAG = 'source:ladderly-expanded-kata'
  const expectedKataCount = 28
  const actualKataCount = await db.checklistItem.count({
    where: {
      checklistId: checklist.id,
      tags: { has: KATA_TAG },
    },
  })
  if (actualKataCount !== expectedKataCount) {
    console.error(
      `Validation failed: expected ${expectedKataCount} Ladderly Expanded Kata problems, found ${actualKataCount}.`,
    )
    throw new Error(
      'LeetCode seed validation failed: Ladderly Expanded Kata count mismatch',
    )
  } else {
    console.log(
      `Validation passed: found ${actualKataCount} Ladderly Expanded Kata problems.`,
    )
  }

  // Additional validation: Grind 75 should have exactly 169 problems
  const GRIND_TAG = 'source:grind-75'
  const expectedGrindCount = 169
  const actualGrindCount = await db.checklistItem.count({
    where: {
      checklistId: checklist.id,
      tags: { has: GRIND_TAG },
    },
  })
  if (actualGrindCount !== expectedGrindCount) {
    console.error(
      `Validation failed: expected ${expectedGrindCount} Grind 75 problems, found ${actualGrindCount}.`,
    )
    throw new Error('LeetCode seed validation failed: Grind 75 count mismatch')
  } else {
    console.log(
      `Validation passed: found ${actualGrindCount} Grind 75 problems.`,
    )
  }

  console.log('LeetCode checklist seeding completed successfully')
}
