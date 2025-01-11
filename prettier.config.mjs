import * as tailwindPlugin from 'prettier-plugin-tailwindcss'

const repoRoot = process.env.REPO_ROOT ? `${process.env.REPO_ROOT}/` : ''

const config = {
  endOfLine: 'auto',
  plugins: [tailwindPlugin],
  printWidth: 80,
  semi: false,
  singleQuote: true,
  tailwindConfig: `${repoRoot}ladderly-io/tailwind.config.ts`,
  tailwindFunctions: ['tw'],
}

export default config
