import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '~/env'
import { observable } from '@trpc/server/observable'
import { TRPCError } from '@trpc/server'

const genAI = new GoogleGenerativeAI(env.GOOGLE_AI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

export const chatRouter = createTRPCRouter({
  streamChat: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(['user', 'assistant']),
            content: z.string(),
          }),
        ),
      }),
    )
    .subscription(async ({ input }) => {
      // Ensure we have messages
      if (input.messages.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No messages provided',
        })
      }

      return observable<string>((emit) => {
        const abortController = new AbortController()

        const geminiMessages = input.messages.map((message) => ({
          role: message.role === 'user' ? 'user' : 'model',
          parts: [{ text: message.content }],
        }))

        void (async () => {
          try {
            const chat = model.startChat({
              history: geminiMessages.slice(0, -1),
            })

            const lastMessage = geminiMessages[geminiMessages.length - 1]
            if (!lastMessage) {
              throw new Error('No message to send')
            }

            const response = await chat.sendMessage(lastMessage.parts[0].text)
            const result = await response.response
            emit.next(result.text())
            emit.complete()
          } catch (error) {
            emit.error(error)
          }
        })()

        return () => {
          abortController.abort()
        }
      })
    }),
})
