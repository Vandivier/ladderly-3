import * as fs from 'fs'
import * as path from 'path'
import { db } from '../src/server/db'
import { seedCourses } from './seed-utils/seedCourses'

// Interfaces for flashcards data
interface FlashCardData {
  question: string
  correctAnswer: string
  distractors: string[]
  explanation?: string
}

interface FlashCardDeckData {
  deckName: string
  deckDescription: string
  courseTitle: string
  flashCards: FlashCardData[]
  quizName?: string
  quizDescription?: string
}

async function seedFlashcardsWithQuizzes(): Promise<void> {
  try {
    console.log('Seeding courses and flashcards...')

    // First, ensure courses are seeded
    await seedCourses()

    // Get the current working directory
    const __dirname = process.cwd() + '/prisma'

    // Read the JSON file
    const filePath = path.resolve(__dirname, './seeds/flashcards.json')

    if (!fs.existsSync(filePath)) {
      console.warn(
        `File ${filePath} does not exist. Skipping flashcard seeding.`,
      )
      return
    }

    const rawData = fs.readFileSync(filePath)
    const flashcardDecks = JSON.parse(rawData.toString()) as FlashCardDeckData[]

    // Keep track of what we're going to keep
    const validQuizIds = new Map<string, Set<number>>()

    for (const deckData of flashcardDecks) {
      // Find the course by title
      const course = await db.course.findFirst({
        where: { title: deckData.courseTitle },
        include: {
          flashCardDecks: true,
          quizzes: true,
        },
      })

      if (!course) {
        console.warn(
          `Course with title "${deckData.courseTitle}" not found. Skipping flashcard deck.`,
        )
        continue
      }

      // Initialize set of valid quiz IDs for this course if not already done
      if (!validQuizIds.has(course.title)) {
        validQuizIds.set(course.title, new Set<number>())
      }

      // Check if flashcard deck already exists
      let flashCardDeck = await db.flashCardDeck.findFirst({
        where: {
          name: deckData.deckName,
          courseId: course.id,
        },
      })

      if (flashCardDeck) {
        console.log(
          `Updating flashcard deck: ${deckData.deckName} for course: ${deckData.courseTitle}`,
        )
        // Update the deck
        flashCardDeck = await db.flashCardDeck.update({
          where: { id: flashCardDeck.id },
          data: {
            description: deckData.deckDescription,
          },
        })
      } else {
        // Create the flashcard deck
        console.log(
          `Creating flashcard deck: ${deckData.deckName} for course: ${deckData.courseTitle}`,
        )
        flashCardDeck = await db.flashCardDeck.create({
          data: {
            name: deckData.deckName,
            description: deckData.deckDescription,
            course: {
              connect: { id: course.id },
            },
          },
        })
      }

      // Get existing flashcards for this deck
      const existingCards = await db.flashCard.findMany({
        where: {
          flashCardDeckId: flashCardDeck.id,
        },
      })

      // Delete existing flashcards for this deck (we'll recreate them)
      if (existingCards.length > 0) {
        await db.flashCard.deleteMany({
          where: {
            flashCardDeckId: flashCardDeck.id,
          },
        })
        console.log(
          `Deleted ${existingCards.length} existing flashcards from deck ${deckData.deckName}`,
        )
      }

      // Create the flashcards for this deck
      for (const cardData of deckData.flashCards) {
        await db.flashCard.create({
          data: {
            question: cardData.question,
            correctAnswer: cardData.correctAnswer,
            distractors: cardData.distractors,
            explanation: cardData.explanation,
            flashCardDeck: {
              connect: { id: flashCardDeck.id },
            },
          },
        })
      }
      console.log(
        `Created ${deckData.flashCards.length} flashcards for deck ${deckData.deckName}`,
      )

      // Handle the quiz for this deck
      const quizName = deckData.quizName ? deckData.quizName : deckData.deckName
      const quizDescription = deckData.quizDescription
        ? deckData.quizDescription
        : `Test your knowledge on ${deckData.deckName}`

      let quiz = await db.quiz.findFirst({
        where: {
          flashCardDeckId: flashCardDeck.id,
          courseId: course.id,
        },
      })

      if (quiz) {
        // Update existing quiz
        quiz = await db.quiz.update({
          where: { id: quiz.id },
          data: {
            name: quizName,
            description: quizDescription,
          },
        })
        console.log(`Updated quiz for flashcard deck: ${deckData.deckName}`)
      } else {
        // Create a new quiz
        quiz = await db.quiz.create({
          data: {
            name: quizName,
            description: quizDescription,
            course: {
              connect: { id: course.id },
            },
            flashCardDeck: {
              connect: { id: flashCardDeck.id },
            },
          },
        })
        console.log(`Created quiz for flashcard deck: ${deckData.deckName}`)
      }

      // Mark this quiz as valid (should not be deleted)
      validQuizIds.get(course.title)!.add(quiz.id)
    }

    // Cascade delete quizzes not found in flashcards.json
    for (const [courseTitle, quizIdSet] of validQuizIds.entries()) {
      const course = await db.course.findFirst({
        where: { title: courseTitle },
        include: { quizzes: true },
      })

      if (course) {
        const quizzesToDelete = course.quizzes.filter(
          (quiz) => !quizIdSet.has(quiz.id),
        )

        if (quizzesToDelete.length > 0) {
          console.log(
            `Deleting ${quizzesToDelete.length} quizzes for course "${courseTitle}" that weren't found in flashcards.json`,
          )

          for (const quiz of quizzesToDelete) {
            await db.quiz.delete({
              where: { id: quiz.id },
            })
          }
        }
      }
    }

    console.log('Flashcard and quiz seeding completed.')
  } catch (error) {
    console.error('Error seeding flashcards and quizzes:', error)
    throw error
  }
}

// Run the seed function
seedFlashcardsWithQuizzes()
  .then(() => {
    console.log('Seeding completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error during seeding:', error)
    process.exit(1)
  })
