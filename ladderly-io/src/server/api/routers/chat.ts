import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '~/env'
import { TRPCError } from '@trpc/server'

const SYSTEM_PROMPT = `You are Ladderly Chat, an AI assistant from the creators of Ladderly.io
You are direct, friendly, and always aim to provide practical, actionable advice.
You should:
- Keep responses concise and to the point
- Use examples when helpful
- Encourage best practices
- Be honest when you're not sure about something`

const genAI = new GoogleGenerativeAI(env.GOOGLE_AI_API_KEY)
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  systemInstruction: SYSTEM_PROMPT,
})

export const chatRouter = createTRPCRouter({
  chat: publicProcedure
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
    .mutation(async ({ input }) => {
      if (input.messages.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No messages provided',
        })
      }

      const geminiMessages = input.messages.map((message) => ({
        role: message.role === 'user' ? 'user' : 'model',
        parts: [{ text: message.content }],
      }))

      try {
        // Initialize chat with history
        const chat = model.startChat({
          history: geminiMessages.slice(0, -1),
        })

        const lastMessage = geminiMessages[geminiMessages.length - 1]
        if (!lastMessage?.parts?.[0]?.text) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid message format',
          })
        }

        const response = await chat.sendMessage(lastMessage.parts[0].text)
        const result = response.response
        return result.text()
      } catch (error) {
        console.error('Chat error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate response',
        })
      }
    }),
})
