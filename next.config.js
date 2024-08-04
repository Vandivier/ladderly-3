// @ts-check
const { withBlitz } = require('@blitzjs/next')

/**
 * @type {import('@blitzjs/next').BlitzConfig}
 **/
const config = {
  experimental: {
    typedRoutes: true,
  },
}

module.exports = withBlitz(config)
