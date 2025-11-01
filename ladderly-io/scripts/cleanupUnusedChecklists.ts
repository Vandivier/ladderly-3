// run like `node --experimental-strip-types scripts/cleanupUnusedChecklists.ts`
// or `tsx scripts/cleanupUnusedChecklists.ts`

import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure dotenv
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function cleanupUnusedChecklists(): Promise<void> {
  try {
    console.log(
      'Starting cleanup of unused checklists and checklist items...\n',
    )

    // Step 1: Delete checklists with no userChecklists (and their items)
    console.log(
      'Step 1: Finding checklists with no associated userChecklists...',
    )
    const checklists = await prisma.checklist.findMany({
      include: {
        userChecklists: true,
        _count: {
          select: {
            userChecklists: true,
          },
        },
      },
    })

    const unusedChecklists = checklists.filter(
      (checklist) => checklist._count.userChecklists === 0,
    )

    if (unusedChecklists.length === 0) {
      console.log('  No unused checklists found.\n')
    } else {
      console.log(`  Found ${unusedChecklists.length} unused checklist(s):`)
      for (const checklist of unusedChecklists) {
        console.log(`    - ${checklist.name} (ID: ${checklist.id})`)
      }

      // Delete checklist items first (they have foreign key to checklist)
      const checklistIds = unusedChecklists.map((c) => c.id)
      const deletedItems = await prisma.checklistItem.deleteMany({
        where: {
          checklistId: {
            in: checklistIds,
          },
        },
      })
      console.log(
        `  Deleted ${deletedItems.count} checklist item(s) from unused checklists.`,
      )

      // Then delete the checklists
      const deletedChecklists = await prisma.checklist.deleteMany({
        where: {
          id: {
            in: checklistIds,
          },
        },
      })
      console.log(`  Deleted ${deletedChecklists.count} unused checklist(s).\n`)
    }

    // Step 2: Clean up orphaned checklist items (items where checklist doesn't exist)
    console.log('Step 2: Finding orphaned checklist items...')
    const allItems = await prisma.checklistItem.findMany({
      select: {
        id: true,
        displayText: true,
        checklistId: true,
      },
    })

    const allChecklistIds = new Set(
      (await prisma.checklist.findMany({ select: { id: true } })).map(
        (c) => c.id,
      ),
    )

    const orphanedItems = allItems.filter(
      (item) => !allChecklistIds.has(item.checklistId),
    )

    if (orphanedItems.length === 0) {
      console.log('  No orphaned checklist items found.\n')
    } else {
      console.log(`  Found ${orphanedItems.length} orphaned item(s):`)
      for (const item of orphanedItems) {
        console.log(
          `    - "${item.displayText}" (ID: ${item.id}, checklistId: ${item.checklistId})`,
        )
      }

      // Delete userChecklistItems that reference orphaned items
      const orphanedItemIds = orphanedItems.map((item) => item.id)
      const deletedUserItems = await prisma.userChecklistItem.deleteMany({
        where: {
          checklistItemId: {
            in: orphanedItemIds,
          },
        },
      })
      console.log(
        `  Deleted ${deletedUserItems.count} userChecklistItem(s) referencing orphaned items.`,
      )

      // Delete the orphaned items
      const deletedOrphaned = await prisma.checklistItem.deleteMany({
        where: {
          id: {
            in: orphanedItemIds,
          },
        },
      })
      console.log(`  Deleted ${deletedOrphaned.count} orphaned item(s).\n`)
    }

    // Step 3: Optional - Clean up items with version mismatches (if version is still relevant)
    // Note: This might be less relevant if version field is deprecated
    console.log('Step 3: Checking for version mismatches...')
    const itemsWithVersions = await prisma.checklistItem.findMany({
      include: {
        checklist: {
          select: {
            id: true,
            name: true,
            version: true,
          },
        },
      },
    })

    const versionMismatches = itemsWithVersions.filter(
      (item) => item.version !== item.checklist.version,
    )

    if (versionMismatches.length === 0) {
      console.log('  No version mismatches found.\n')
    } else {
      console.log(
        `  Found ${versionMismatches.length} item(s) with version mismatches:`,
      )
      for (const item of versionMismatches) {
        console.log(
          `    - "${item.displayText}" (item version: ${item.version}, checklist version: ${item.checklist.version})`,
        )
      }
      console.log(
        '  Note: Version mismatches are not automatically deleted as the version field may be deprecated.\n',
      )
    }

    console.log('Cleanup completed successfully!')
  } catch (error) {
    console.error('Error during cleanup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

cleanupUnusedChecklists().catch((error: Error) => {
  console.error('Script failed:', error)
  process.exit(1)
})
