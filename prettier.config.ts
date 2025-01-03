const config = {
  endOfLine: 'auto',
  plugins: [require('prettier-plugin-tailwindcss')],
  printWidth: 80,
  semi: false,
  singleQuote: true,
  tailwindConfig: 'ladderly-io/tailwind.config.ts',
  tailwindFunctions: ['tw'],
}

export default config
