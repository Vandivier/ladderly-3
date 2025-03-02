import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import React from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

// Mock fs module
vi.mock('fs', () => ({
  default: {
    readdirSync: vi.fn(() => [
      {
        name: 'test-post-1.md',
        isFile: () => true,
      },
      {
        name: 'test-post-2.md',
        isFile: () => true,
      },
    ]),
    readFileSync: vi.fn(),
  },
}))

// Mock path module
vi.mock('path', () => ({
  default: {
    join: vi.fn((base: string, ...paths: string[]) => paths.join('/')),
    extname: vi.fn((path: string) => '.md'),
  },
}))

// Mock gray-matter
vi.mock('gray-matter', () => ({
  default: vi.fn(),
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement('a', { href }, children),
}))

// Mock LadderlyPageWrapper
vi.mock('~/app/core/components/page-wrapper/LadderlyPageWrapper', () => ({
  LadderlyPageWrapper: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'page-wrapper' }, children),
}))

// Import after mocks
import BlogIndex from '~/app/blog/page'

describe('BlogIndex', () => {
  const mockPosts = [
    {
      slug: 'test-post-1',
      title: 'Test Post 1',
      date: '2024-03-15',
      author: 'Test Author 1',
      premium: false,
    },
    {
      slug: 'test-post-2',
      title: 'Test Post 2',
      date: '2024-03-16',
      author: 'Test Author 2',
      premium: true,
    },
  ] as const

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock fs.readdirSync to return filenames as strings
    vi.mocked(fs.readdirSync).mockReturnValue([
      'test-post-1.md',
      'test-post-2.md',
    ])

    // Mock path.extname to return .md
    vi.mocked(path.extname).mockReturnValue('.md')

    // Mock fs.readFileSync for each post
    vi.mocked(fs.readFileSync).mockImplementation((filepath) => {
      const filename =
        typeof filepath === 'string' ? filepath.split('/').pop() : ''
      const postIndex = filename === 'test-post-1.md' ? 0 : 1
      return Buffer.from(
        JSON.stringify({
          title: mockPosts[postIndex].title,
          date: mockPosts[postIndex].date,
          author: mockPosts[postIndex].author,
          premium: mockPosts[postIndex].premium,
        }),
      )
    })

    // Mock matter to return our test data
    vi.mocked(matter).mockImplementation((content) => {
      const data = JSON.parse(content.toString())
      return {
        data,
        content: 'mock content',
        orig: content.toString(),
        language: '',
        matter: '',
        stringify: () => '',
      }
    })
  })

  test('renders blog post list', async () => {
    const component = await BlogIndex()
    render(component)

    // Check if both post titles are rendered
    mockPosts.forEach((post) => {
      const title = screen.getByText(post.title)
      expect(title).toBeDefined()
    })
  })

  test('displays premium badge for premium posts', async () => {
    const component = await BlogIndex()
    render(component)

    // Check for premium badge (lock icon)
    const premiumBadge = screen.getByRole('link', {
      name: /premium article/i,
    })
    expect(premiumBadge).toBeDefined()

    // Verify premium badge is only shown once (for the second post)
    const premiumBadges = screen.getAllByRole('link', {
      name: /premium article/i,
    })
    expect(premiumBadges).toHaveLength(1)
  })

  test('displays author and date information', async () => {
    const component = await BlogIndex()
    render(component)

    // Check if author and date info is displayed for both posts
    mockPosts.forEach((post) => {
      const publishInfo = screen.getByText(
        `Published on ${post.date} by ${post.author}`,
      )
      expect(publishInfo).toBeDefined()
    })
  })

  test('links to individual blog posts', async () => {
    const component = await BlogIndex()
    render(component)

    // Check if links to individual posts are created
    mockPosts.forEach((post) => {
      const link = screen.getByRole('link', { name: post.title })
      expect(link).toBeDefined()
      expect(link).toHaveAttribute('href', `/blog/${post.slug}`)
    })
  })
})
