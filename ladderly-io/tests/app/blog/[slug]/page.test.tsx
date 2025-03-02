import React from 'react'
import { expect, test, vi, describe, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { getServerAuthSession } from '~/server/auth'
import { notFound } from 'next/navigation'

// Mock all external components and modules
vi.mock('fs', () => ({
  default: {
    readdirSync: vi.fn(),
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
  },
}))

vi.mock('path', () => ({
  default: {
    join: vi.fn(),
  },
}))

vi.mock('gray-matter', () => ({
  default: vi.fn(),
}))

vi.mock('~/server/auth', () => ({
  getServerAuthSession: vi.fn(),
}))

// Mock the BlogPostContent component
vi.mock('./BlogPostContent', () => ({
  BlogPostContent: ({ content }: { content: string }) =>
    React.createElement('div', { 'data-testid': 'blog-content' }, content),
}))

// Mock the LadderlyPageWrapper component to handle premium content
vi.mock('~/app/core/components/page-wrapper/LadderlyPageWrapper', () => ({
  LadderlyPageWrapper: ({
    children,
    authenticate,
    requirePremium,
    previewView,
  }: {
    children: React.ReactNode
    authenticate?: boolean
    requirePremium?: boolean
    previewView?: React.ReactNode
  }) => {
    // If premium content is required, show the preview
    if (requirePremium && previewView) {
      return React.createElement(
        'div',
        { 'data-testid': 'page-wrapper' },
        previewView,
      )
    }
    return React.createElement(
      'div',
      { 'data-testid': 'page-wrapper' },
      children,
    )
  },
}))

// Import after mocks
import BlogPost, { calculateReadingTime } from '~/app/blog/[slug]/page'

describe('calculateReadingTime', () => {
  test('calculates reading time correctly', () => {
    const testContent = 'word '.repeat(476) // 476 words should be 2 minutes at 238 wpm
    expect(calculateReadingTime(testContent)).toBe(2)
  })

  test('handles empty content', () => {
    expect(calculateReadingTime('')).toBe(0)
  })

  test('rounds to nearest minute', () => {
    const testContent = 'word '.repeat(357) // 357 words should round to 2 minutes
    expect(calculateReadingTime(testContent)).toBe(2)
  })
})

describe('BlogPost', () => {
  const mockPost = {
    slug: 'test-post',
    title: 'Test Post',
    author: 'Test Author',
    content: 'This is a test post content.',
    excerpt: 'This is a test excerpt.',
    toc: [],
    premium: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(path.join).mockReturnValue('/mock/path/test-post.md')
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue('mock file contents')
    vi.mocked(matter).mockReturnValue({
      data: {
        title: mockPost.title,
        author: mockPost.author,
        premium: mockPost.premium,
      },
      content: mockPost.content,
      orig: mockPost.content,
      language: '',
      matter: '',
      stringify: () => '',
    })
    vi.mocked(getServerAuthSession).mockResolvedValue(null)
  })

  test('renders blog post title', async () => {
    const component = await BlogPost({ params: { slug: 'test-post' } })
    render(component)

    const title = screen.getByText(mockPost.title)
    expect(title).toBeDefined()
  })

  test('displays reading time', async () => {
    const component = await BlogPost({ params: { slug: 'test-post' } })
    render(component)

    const readingTime = screen.getByText(/Estimated read time:/i)
    expect(readingTime).toBeDefined()
  })

  test('handles premium content correctly', async () => {
    // Mock premium post
    const premiumPost = {
      ...mockPost,
      premium: true,
    }

    // Mock matter to return premium content
    vi.mocked(matter).mockReturnValue({
      data: {
        title: premiumPost.title,
        author: premiumPost.author,
        premium: true, // Make sure this is explicitly true
      },
      content: premiumPost.content,
      orig: premiumPost.content,
      language: '',
      matter: '',
      stringify: () => '',
    })

    // Mock getServerAuthSession to return null (unauthenticated)
    vi.mocked(getServerAuthSession).mockResolvedValue(null)

    const component = await BlogPost({ params: { slug: 'test-post' } })
    const { container } = render(component)

    // Debug output to see what's being rendered
    console.log(container.innerHTML)

    // Check for premium content
    const premiumIndicator = screen.queryByText(/Ladderly Premium Content/i)
    expect(premiumIndicator).not.toBeNull()

    // Check for upgrade button
    const upgradeButton = screen.queryByText('Sign Up Now')
    expect(upgradeButton).not.toBeNull()
  })

  test('handles non-existent post', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)

    try {
      const component = await BlogPost({ params: { slug: 'non-existent' } })
      render(component)
    } catch {
      // Expected to throw when notFound is called
    }

    expect(notFound).toHaveBeenCalled()
  })
})
