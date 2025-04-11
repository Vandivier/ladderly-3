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
    readdirSync: vi.fn(() => ['test-post-1.md', 'test-post-2.md']),
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
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode
    href: string
    className?: string
  }) =>
    React.createElement(
      'a',
      { href, className, 'data-testid': 'link' },
      children,
    ),
}))

// Mock LadderlyPageWrapper
vi.mock('~/app/core/components/page-wrapper/LadderlyPageWrapper', () => ({
  LadderlyPageWrapper: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'page-wrapper' }, children),
}))

// Mock LockIcon for premium content
vi.mock('lucide-react', () => ({
  LockIcon: () =>
    React.createElement('span', { 'data-testid': 'lock-icon' }, '🔒'),
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
      excerpt: 'This is the first test post excerpt.',
      toc: [],
    },
    {
      slug: 'test-post-2',
      title: 'Test Post 2',
      date: '2024-03-16',
      author: 'Test Author 2',
      premium: true,
      excerpt: 'This is the second test post excerpt which is premium content.',
      toc: [
        { id: 'heading-1', text: 'Heading 1', level: 2 },
        { id: 'heading-2', text: 'Heading 2', level: 3 },
      ],
    },
  ] as const

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock fs.readdirSync to return our mock files
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
          excerpt: mockPosts[postIndex].excerpt,
          toc: mockPosts[postIndex].toc,
        }),
      )
    })

    // Mock matter to return our test data
    vi.mocked(matter).mockImplementation((content) => {
      const data = JSON.parse(content.toString())
      return {
        data,
        content: data.excerpt || 'mock content',
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
      expect(title).toBeInTheDocument()
    })
  })

  test('displays premium badge for premium posts only', async () => {
    const component = await BlogIndex()
    render(component)

    // Get all lock icons (premium indicators)
    const lockIcons = screen.getAllByTestId('lock-icon')

    // Should be exactly one premium post
    expect(lockIcons).toHaveLength(1)

    // The premium post should be linked to the correct post
    const premiumPostLink = screen.getByText(mockPosts[1].title)
    expect(premiumPostLink).toBeInTheDocument()
    expect(premiumPostLink.closest('div')).toContainElement(lockIcons[0])
  })

  test('properly structures premium badge with tooltip', async () => {
    const component = await BlogIndex()
    render(component)

    // Premium badge should be in a relative group
    const premiumBadge = screen.getByTestId('lock-icon').closest('a')
    expect(premiumBadge).toHaveClass('group')
    expect(premiumBadge).toHaveClass('relative')

    // Check for tooltip text
    const tooltipText = screen.getByText(/Premium Article/i)
    expect(tooltipText).toBeInTheDocument()
  })

  test('displays author and date information', async () => {
    const component = await BlogIndex()
    render(component)

    // Check if author and date info is displayed for both posts
    mockPosts.forEach((post) => {
      const publishInfo = screen.getByText(
        `Published on ${post.date} by ${post.author}`,
      )
      expect(publishInfo).toBeInTheDocument()
    })
  })

  test('links to individual blog posts with correct URLs', async () => {
    const component = await BlogIndex()
    render(component)

    // Check if links to individual posts are created
    mockPosts.forEach((post) => {
      const link = screen.getByRole('link', { name: post.title })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', `/blog/${post.slug}`)
    })
  })

  test('orders posts with newest first', async () => {
    const component = await BlogIndex()
    render(component)

    // Get all blog post titles
    const titles = screen.getAllByText(/Test Post/i)

    // The second post (newer date) should appear first
    expect(titles[0].textContent).toBe(mockPosts[1].title)
    expect(titles[1].textContent).toBe(mockPosts[0].title)
  })
})
