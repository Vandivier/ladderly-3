const blitzConfig = require("@blitzjs/next/eslint")

module.exports = {
  ...blitzConfig,
  extends: [
    ...blitzConfig.extends,
    "next/core-web-vitals",
    "plugin:tailwindcss/recommended",
  ],
  rules: {
    ...blitzConfig.rules,
    ...{
      "tailwindcss/no-custom-classname": ["off"],
    },
  },
}
