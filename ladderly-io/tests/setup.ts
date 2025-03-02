import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { afterEach, expect, vi } from 'vitest'

// Extend Vitest's expect method with React Testing Library's matchers
expect.extend(matchers)

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}))

// Set up global fetch mock
global.fetch = vi.fn()

// Simple CSS mock
vi.mock('**/*.css', () => ({
  default: new Proxy(
    {},
    {
      get: (target, prop) => prop,
    },
  ),
}))
