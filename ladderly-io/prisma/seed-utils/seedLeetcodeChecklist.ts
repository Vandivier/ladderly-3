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

  // Check if a LeetCode Problems checklist already exists
  const existingChecklist = await db.checklist.findFirst({
    where: {
      name: 'LeetCode Problems',
    },
    orderBy: {
      version: 'desc',
    },
  })

  // Create a new checklist with updated version if it already exists
  const version = new Date().toISOString()

  // Helper to build tags from a problem
  const buildTags = (problem: LeetcodeProblem): string[] => {
    const tags: string[] = []

    // Sources as tags
    const source = problem?.source ?? 'unknown'
    if (Array.isArray(source)) {
      tags.push(...source.map((s) => `source:${s}`))
    } else if (source) {
      tags.push(`source:${source}`)
    }

    // Patterns as tags
    const patterns = problem?.patterns ?? []
    if (Array.isArray(patterns) && patterns.length > 0) {
      tags.push(...patterns.map((p) => `pattern:${p}`))
    }

    return Array.from(new Set(tags))
  }

  if (!existingChecklist) {
    console.log(
      'No existing LeetCode Problems checklist found. Creating new one...',
    )

    // Create a new checklist for LeetCode Problems
    const checklist = await db.checklist.create({
      data: {
        name: 'LeetCode Problems',
        version,
      },
    })

    console.log(
      `Created Checklist with ID ${checklist.id} and version ${version}`,
    )

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
  } else {
    console.log(
      `Existing LeetCode Problems checklist found with ID ${existingChecklist.id} and version ${existingChecklist.version}`,
    )
    console.log(
      'Updating existing items with pattern/source tags (idempotent)...',
    )

    // Fetch items for this checklist once to avoid repeated queries
    const items = await db.checklistItem.findMany({
      where: { checklistId: existingChecklist.id },
      select: { id: true, displayText: true, tags: true },
    })

    const nameToItem = new Map(items.map((it) => [it.displayText, it]))

    let updated = 0
    let skipped = 0
    for (const problem of problems) {
      const match = nameToItem.get(problem.name)
      if (!match) {
        skipped++
        continue
      }

      const newTags = buildTags(problem)
      const merged = Array.from(new Set([...(match.tags ?? []), ...newTags]))

      // Only update if there's a difference
      const isSame =
        merged.length === (match.tags ?? []).length &&
        merged.every((t) => (match.tags ?? []).includes(t))
      if (isSame) {
        skipped++
        continue
      }

      await db.checklistItem.update({
        where: { id: match.id },
        data: { tags: merged },
      })
      updated++
    }

    console.log(
      `Updated ${updated} items; skipped ${skipped} items (no change).`,
    )
  }

  console.log('LeetCode checklist seeding completed successfully')
}
