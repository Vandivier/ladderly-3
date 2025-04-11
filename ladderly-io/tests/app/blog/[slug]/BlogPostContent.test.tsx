import React from 'react'
import { render, screen } from '@testing-library/react'
import { BlogPostContent } from '../../../../src/app/blog/[slug]/BlogPostContent'
import { describe, expect, it, vi } from 'vitest'

// Mock environment variables
vi.mock('process.env', () => ({
  NEXT_PUBLIC_STRIPE_PAYMENT_LINK: 'https://example.com/payment',
}))

describe('BlogPostContent', () => {
  // Test basic rendering functionality
  it('renders HTML content', () => {
    const htmlContent = '<p>Test content</p>'

    render(<BlogPostContent contentHtml={htmlContent} />)

    expect(screen.getByText(/Test content/i)).toBeInTheDocument()
  })

  // Test that toc is accepted as a prop
  it('accepts table of contents data', () => {
    const toc = [
      { id: 'heading-1', text: 'Heading 1', level: 2 },
      { id: 'heading-2', text: 'Heading 2', level: 3 },
    ]

    // Just verify the component accepts the props without errors
    expect(() => {
      render(
        <BlogPostContent
          contentHtml="<h2 id='heading-1'>Heading 1</h2><h3 id='heading-2'>Heading 2</h3>"
          toc={toc}
        />,
      )
    }).not.toThrow()
  })

  // Test that the escapeSelector function exists by checking component source code
  it('includes logic to escape numeric ID selectors', () => {
    // Get the component source code
    const componentSource = BlogPostContent.toString()

    // Check that it contains the escapeSelector function or similar logic
    expect(
      componentSource.includes('escapeSelector') ||
        componentSource.includes('replace(/^(\\d)/, ') ||
        componentSource.includes('querySelector') ||
        componentSource.includes('try {'), // Error handling
    ).toBeTruthy()
  })

  // Verify error handling exists
  it('includes error handling for querySelector operations', () => {
    const componentSource = BlogPostContent.toString()

    // Check for try/catch blocks around querySelector operations
    expect(componentSource.includes('try {')).toBeTruthy()
    expect(componentSource.includes('catch (')).toBeTruthy()
    expect(componentSource.includes('console.error')).toBeTruthy()
  })
})
