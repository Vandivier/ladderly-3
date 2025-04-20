import * as fs from 'fs'
import * as path from 'path'
import { db } from '../../src/server/db'

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

export async function seedFlashcards(): Promise<void> {
  try {
    console.log('Seeding flashcards...')

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

    for (const deckData of flashcardDecks) {
      // Find the course by title
      const course = await db.course.findFirst({
        where: { title: deckData.courseTitle },
      })

      if (!course) {
        console.warn(
          `Course with title "${deckData.courseTitle}" not found. Skipping flashcard deck.`,
        )
        continue
      }

      // Check if flashcard deck already exists
      const existingDeck = await db.flashCardDeck.findFirst({
        where: {
          name: deckData.deckName,
          courseId: course.id,
        },
      })

      if (existingDeck) {
        console.log(
          `Flashcard deck "${deckData.deckName}" already exists for course "${deckData.courseTitle}". Skipping.`,
        )
        continue
      }

      // Create the flashcard deck
      console.log(
        `Creating flashcard deck: ${deckData.deckName} for course: ${deckData.courseTitle}`,
      )
      const flashCardDeck = await db.flashCardDeck.create({
        data: {
          name: deckData.deckName,
          description: deckData.deckDescription,
          course: {
            connect: { id: course.id },
          },
        },
      })

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

      // Check if a quiz already exists for this deck
      const existingQuiz = await db.quiz.findFirst({
        where: {
          flashCardDeckId: flashCardDeck.id,
          courseId: course.id,
        },
      })

      if (!existingQuiz) {
        // Create a quiz for this flashcard deck
        const quizName = deckData.quizName
          ? deckData.quizName
          : deckData.deckName
        const quizDescription = deckData.quizDescription
          ? deckData.quizDescription
          : `Test your knowledge on ${deckData.deckName}`

        await db.quiz.create({
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
      } else {
        console.log(
          `Quiz already exists for flashcard deck: ${deckData.deckName}. Skipping.`,
        )
      }
    }

    console.log('Flashcard seeding completed.')
  } catch (error) {
    console.error('Error seeding flashcards:', error)
  }
}
