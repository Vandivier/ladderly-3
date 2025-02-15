'use client'

import { useState } from 'react'
import { Send, User, Bot } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function ChatMessage({ message }: { message: Message }) {
  return (
    <div
      className={`flex w-full ${
        message.role === 'assistant'
          ? 'bg-gray-50 dark:bg-gray-800'
          : 'bg-white dark:bg-gray-900'
      } px-4 py-6 md:px-8`}
    >
      <div className="container mx-auto max-w-3xl">
        <div className="flex gap-4">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              message.role === 'assistant' ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            {message.role === 'assistant' ? (
              <Bot className="h-5 w-5 text-white" />
            ) : (
              <User className="h-5 w-5 text-white" />
            )}
          </div>
          <div className="flex-1">
            <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-100">
              {message.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatInput({ onSend }: { onSend: (message: string) => void }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSend(input)
      setInput('')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="container mx-auto max-w-3xl">
        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 rounded-lg border border-gray-300 bg-white p-3 text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-offset-gray-900"
          />
          <button
            type="submit"
            className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-900"
            disabled={!input.trim()}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </form>
  )
}

export const ClientChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! How can I help you today?',
    },
  ])
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (content: string) => {
    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content }])

    // TODO: Implement actual API call here
    setIsLoading(true)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'This is a placeholder response. API integration coming soon!',
        },
      ])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-white dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        {isLoading && (
          <div className="container mx-auto max-w-3xl px-4 py-4">
            <div className="flex gap-2">
              <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.3s] dark:bg-gray-400"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.15s] dark:bg-gray-400"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 dark:bg-gray-400"></div>
            </div>
          </div>
        )}
      </div>
      <ChatInput onSend={handleSendMessage} />
    </div>
  )
}
