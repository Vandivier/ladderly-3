import { GoogleGenerativeAI } from '@google/generative-ai'
import { StreamingTextResponse, GoogleGenerativeAIStream } from 'ai'
import { env } from '~/env'

const genAI = new GoogleGenerativeAI(env.GOOGLE_AI_API_KEY)

export async function POST(req: Request) {
  const { messages } = await req.json()
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  // Convert messages to Gemini format
  const prompt = messages.map((message: any) => ({
    role: message.role === 'user' ? 'user' : 'model',
    parts: [{ text: message.content }],
  }))

  const response = await model.generateContentStream({
    contents: prompt,
  })

  // Convert the response to a friendly format for Vercel AI
  const stream = GoogleGenerativeAIStream(response)

  // Return a StreamingTextResponse, which can be consumed by the client
  return new StreamingTextResponse(stream)
}
