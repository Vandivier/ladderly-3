import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.tsx'],
    pool: 'threads',
    poolOptions: {
      threads: {
        // TODO: this is hiding leaked test state...
        singleThread: true,
      },
    },
    coverage: {
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './tests/coverage',
      exclude: [
        'coverage/**',
        'dist/**',
        '**/node_modules/**',
        '.next/**',
        'scripts/**/*',
      ],
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
      src: path.resolve(__dirname, './src'),
    },
  },
  css: {
    modules: {
      generateScopedName: '[local]',
    },
  },
})
