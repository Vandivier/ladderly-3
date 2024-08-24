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
  async rewrites() {
    return [
      {
        source: '/api/rpc/:path*',
        destination: '/api/rpc/:path*',
      },
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
}

module.exports = withBlitz(config)
