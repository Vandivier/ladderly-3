import { defineConfig } from 'vitest/config'
import path from 'path'

/**
 * Vitest configuration for integration tests.
 * These tests run against a live Next.js server and make real HTTP requests.
 * They use the 'node' environment (not jsdom) to leverage Node 22's native fetch.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    // No setup files needed - Node 22 has native fetch/Headers
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
      src: path.resolve(__dirname, './src'),
    },
  },
})
