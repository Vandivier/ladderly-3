const blitzConfig = require("@blitzjs/next/eslint")

module.exports = {
  ...blitzConfig,
  extends: [...blitzConfig.extends, "plugin:tailwindcss/recommended"],
  rules: {
    ...blitzConfig.rules,
    ...{
      "tailwindcss/no-custom-classname": ["off"],
    },
  },
}
