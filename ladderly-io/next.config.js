/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./src/env.js')

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      { hostname: 'api.producthunt.com' },
      { hostname: 'www.google.com' },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Security headers to prevent clickjacking and other attacks
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
  webpack: (config, { isServer }) => {
    // Ignore node-specific modules on client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }

    // Add argon2 to externals
    if (!isServer) {
      config.externals = [...(config.externals || []), 'argon2']
    }

    // Ignore scripts and tests directories during build
    config.watchOptions = {
      ...config.watchOptions,
      ignored: Array.isArray(config.watchOptions?.ignored)
        ? [...config.watchOptions.ignored, '**/scripts/**', '**/tests/**']
        : ['**/scripts/**', '**/tests/**'],
    }

    return config
  },
  // Explicitly exclude test files from being processed by Next.js
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'].filter(
    (ext) => !ext.includes('test.'),
  ),
}

export default config
