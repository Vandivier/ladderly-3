/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [{ hostname: "api.producthunt.com" }],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Ignore scripts directory during build
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: Array.isArray(config.watchOptions?.ignored)
        ? [...config.watchOptions.ignored, "**/scripts/**"]
        : ["**/scripts/**"],
    };
    return config;
  },
};

export default config;
