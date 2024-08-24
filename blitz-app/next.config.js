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
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  basePath: '',
  assetPrefix: '',
}

module.exports = withBlitz(config)
