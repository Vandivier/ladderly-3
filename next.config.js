// @ts-check
const { withBlitz } = require('@blitzjs/next')

/**
 * @type {import('@blitzjs/next').BlitzConfig}
 **/
const config = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    domains: ['api.producthunt.com'],
  },
}

module.exports = withBlitz(config)
