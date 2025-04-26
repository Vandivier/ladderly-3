'use client'

import React, { useState, useCallback } from 'react'
import { api } from '~/trpc/react'
import { Bot } from 'lucide-react'
import type { JournalEntryType } from '@prisma/client'

interface JournalEntry {
  id: number
  content: string
  createdAt: Date
  entryType: JournalEntryType
  isCareerRelated: boolean
  isMarkdown: boolean
  mintedFromDateRange: Date[]
  mintedFromHashtag: string | null
  updatedAt: Date
  userId: number
}

export const StoryGenerator = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hashtag, setHashtag] = useState('')
  const [contentType, setContentType] = useState('STAR')
  const [isSearching, setIsSearching] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)
  const [foundEntries, setFoundEntries] = useState<JournalEntry[]>([])
  const [selectedEntries, setSelectedEntries] = useState<Set<number>>(new Set())

  // Set up the search query with enabled: false so we can manually trigger it
  const searchQuery = api.journal.getUserEntries.useQuery(
    {
      limit: 100,
      hashtag: hashtag || undefined,
    },
    {
      enabled: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  )

  // Handle successful search results
  const handleSearchSuccess = useCallback(() => {
    if (searchQuery.data) {
      setFoundEntries(searchQuery.data.entries)

      // Auto-select all entries
      const newSelectedEntries = new Set<number>()
      searchQuery.data.entries.forEach((entry) =>
        newSelectedEntries.add(entry.id),
      )
      setSelectedEntries(newSelectedEntries)
    }
    setIsSearching(false)
  }, [searchQuery.data])

  // Set up the chat mutation for content generation
  const chatMutation = api.chat.chat.useMutation({
    onSuccess: (response) => {
      setGeneratedContent(response)
      setIsGenerating(false)
    },
    onError: (error) => {
      console.error('Content generation error:', error)
      setGeneratedContent('Sorry, there was an error generating your content.')
      setIsGenerating(false)
    },
  })

  // Get user journal entries by hashtag
  const searchByHashtag = async () => {
    if (!hashtag) return

    setIsSearching(true)
    setFoundEntries([])
    setSelectedEntries(new Set())

    // Trigger the query manually
    try {
      await searchQuery.refetch()
      handleSearchSuccess()
    } catch (error) {
      console.error('Error searching for hashtags:', error)
      setIsSearching(false)
    }
  }

  // Handle checkbox change for entry selection
  const toggleEntrySelection = (entryId: number) => {
    const newSelectedEntries = new Set(selectedEntries)
    if (newSelectedEntries.has(entryId)) {
      newSelectedEntries.delete(entryId)
    } else {
      newSelectedEntries.add(entryId)
    }
    setSelectedEntries(newSelectedEntries)
  }

  // Generate content using Gemini
  const generateContent = () => {
    if (selectedEntries.size === 0) return

    setIsGenerating(true)
    setGeneratedContent(null)

    // Get the selected entries
    const entriesToUse = foundEntries.filter((entry) =>
      selectedEntries.has(entry.id),
    )

    // Format entries for the prompt
    const entryTexts = entriesToUse.map((entry) => entry.content).join('\n\n')

    // Create a prompt based on content type
    let prompt = ''
    switch (contentType) {
      case 'STAR':
        prompt = `Based on these journal entries about #${hashtag}, generate a professional STAR (Situation, Task, Action, Result) format anecdote I can use in interviews:\n\n${entryTexts}`
        break
      case 'POST':
        prompt = `Based on these journal entries about #${hashtag}, write a concise, engaging social media post that highlights my professional achievements or learnings:\n\n${entryTexts}`
        break
      case 'POEM':
        prompt = `Based on these journal entries about #${hashtag}, compose a short inspirational poem that captures the essence of my professional journey:\n\n${entryTexts}`
        break
      default:
        prompt = `Based on these journal entries about #${hashtag}, create a concise summary:\n\n${entryTexts}`
    }

    // Call Gemini API
    chatMutation.mutate({
      messages: [{ role: 'user', content: prompt }],
    })
  }

  // Format date to readable string
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold dark:text-gray-100">
          <span className="mr-2">✨</span>
          Content Generator
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {isExpanded ? 'Hide' : 'Show'}
        </button>
      </div>

      {isExpanded && (
        <div>
          <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
            Generate AI-powered content from your hashtagged journal entries.
            Great for preparing for interviews or sharing your professional
            journey!
          </p>

          {/* Hashtag search input */}
          <div className="mb-4">
            <label
              htmlFor="hashtag"
              className="mb-1 block text-sm font-medium dark:text-gray-300"
            >
              Enter a Hashtag (without #)
            </label>
            <div className="flex">
              <input
                id="hashtag"
                type="text"
                value={hashtag}
                onChange={(e) =>
                  setHashtag(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))
                }
                placeholder="promotion"
                className="flex-1 rounded-l-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                disabled={isSearching || isGenerating}
              />
              <button
                onClick={searchByHashtag}
                disabled={!hashtag || isSearching || isGenerating}
                className="rounded-r-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-gray-700"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Content type selection */}
          {foundEntries.length > 0 && (
            <div className="mb-4">
              <label
                htmlFor="contentType"
                className="mb-1 block text-sm font-medium dark:text-gray-300"
              >
                Content Type
              </label>
              <select
                id="contentType"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full rounded border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                disabled={isGenerating}
              >
                <option value="STAR">STAR Method Anecdote</option>
                <option value="POST">Social Media Post</option>
                <option value="POEM">Inspirational Poem</option>
              </select>
            </div>
          )}

          {/* Found entries with checkboxes */}
          {foundEntries.length > 0 && (
            <div className="mb-4">
              <h4 className="mb-2 text-sm font-medium dark:text-gray-300">
                Found Entries ({foundEntries.length})
              </h4>
              <div className="max-h-64 overflow-y-auto rounded border border-gray-200 p-2 dark:border-gray-700 dark:bg-gray-800/50">
                {foundEntries.map((entry) => (
                  <div key={entry.id} className="mb-2 flex items-start">
                    <input
                      type="checkbox"
                      id={`entry-${entry.id}`}
                      checked={selectedEntries.has(entry.id)}
                      onChange={() => toggleEntrySelection(entry.id)}
                      className="mr-2 mt-1"
                      disabled={isGenerating}
                    />
                    <label
                      htmlFor={`entry-${entry.id}`}
                      className="text-sm dark:text-gray-300"
                    >
                      <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(entry.createdAt)}
                      </div>
                      <div className="line-clamp-2">{entry.content}</div>
                    </label>
                  </div>
                ))}
                {foundEntries.length === 0 && (
                  <p className="p-2 text-sm text-gray-500 dark:text-gray-400">
                    No entries found with hashtag #{hashtag}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* No entries found message */}
          {hashtag &&
            searchQuery.isFetched &&
            foundEntries.length === 0 &&
            !isSearching && (
              <div className="mb-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                No entries found with hashtag #{hashtag}. Try a different
                hashtag or add entries with this tag first.
              </div>
            )}

          {/* Generate button */}
          {foundEntries.length > 0 && selectedEntries.size > 0 && (
            <button
              onClick={generateContent}
              disabled={selectedEntries.size === 0 || isGenerating}
              className="mb-4 w-full rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:bg-gray-300 dark:bg-purple-700 dark:hover:bg-purple-800 dark:disabled:bg-gray-700"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center">
                  <span className="mr-2">Generating</span>
                  <span className="inline-block animate-pulse">...</span>
                </span>
              ) : (
                'Generate Content'
              )}
            </button>
          )}

          {/* Generated content display */}
          {generatedContent && (
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-900/30 dark:bg-purple-900/20">
              <h4 className="mb-2 flex items-center text-base font-medium text-purple-800 dark:text-purple-300">
                <Bot className="mr-2 h-4 w-4" />
                Generated{' '}
                {contentType === 'STAR'
                  ? 'STAR Anecdote'
                  : contentType === 'POST'
                    ? 'Social Post'
                    : 'Poem'}
              </h4>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                {generatedContent}
              </div>

              <div className="mt-4 text-right">
                <button
                  onClick={() => {
                    navigator.clipboard
                      .writeText(generatedContent)
                      .then(() => alert('Content copied to clipboard!'))
                      .catch(() => alert('Failed to copy text'))
                  }}
                  className="rounded bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
          )}

          {/* Tips section */}
          <div className="mt-4">
            <h4 className="mb-2 text-base font-medium dark:text-gray-200">
              Tips for Using Generated Content
            </h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>Review and edit the generated content to match your voice</li>
              <li>Use STAR method anecdotes for interview preparation</li>
              <li>
                Add specific metrics and outcomes to strengthen narratives
              </li>
              <li>Try different hashtags to generate diverse content</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default StoryGenerator
