module.exports = {
  plugins: [require('prettier-plugin-tailwindcss')],
  tailwindConfig: './tailwind.config.js',
  tailwindFunctions: ['tw'],
  semi: false,
  singleQuote: true,
  printWidth: 80,
}
