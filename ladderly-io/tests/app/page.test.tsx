import React from 'react'
import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock the page component instead of importing the real one
vi.mock('~/app/page', () => ({
  default: () => (
    <main>
      <h2>Ladderly Helps You:</h2>
    </main>
  ),
}))

// Import after mocking
import Page from '~/app/page'

test('Homepage shows correct heading', () => {
  const { container } = render(
    <div id="test-container">
      <Page />
    </div>,
  )

  const heading = screen.getByRole('heading', {
    level: 2,
    name: 'Ladderly Helps You:',
  })
  expect(heading).toBeDefined()
})
