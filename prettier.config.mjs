import * as tailwindPlugin from 'prettier-plugin-tailwindcss'

const config = {
  endOfLine: 'auto',
  plugins: [tailwindPlugin],
  printWidth: 80,
  semi: false,
  singleQuote: true,
  tailwindConfig: 'ladderly-io/tailwind.config.ts',
  tailwindFunctions: ['tw'],
}

export default config
