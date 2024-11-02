module.exports = {
  endOfLine: 'auto',
  plugins: [require('prettier-plugin-tailwindcss')],
  printWidth: 80,
  semi: false,
  singleQuote: true,
  tailwindConfig: './tailwind.config.js',
  tailwindFunctions: ['tw'],
}
