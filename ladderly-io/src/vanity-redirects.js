// Vanity URLs that forward to external destinations.
// Kept as plain JS so next.config.js can import it directly.

export const NOELLE_GOFUNDME_URL =
  'https://www.gofundme.com/f/strength-for-noelle-and-the-baumann-family'

/** @type {Record<string, string>} */
export const VANITY_URLS = {
  '/noelle': NOELLE_GOFUNDME_URL,
  '/noel': NOELLE_GOFUNDME_URL,
  '/fcancer': NOELLE_GOFUNDME_URL,
  '/f-cancer': NOELLE_GOFUNDME_URL,
}

/**
 * Builds Next.js redirect entries for all vanity URLs.
 * Non-permanent (307) so destinations can change without stale browser caches.
 * @returns {{ source: string, destination: string, permanent: boolean }[]}
 */
export const getVanityRedirects = () =>
  Object.entries(VANITY_URLS).map(([source, destination]) => ({
    source,
    destination,
    permanent: false,
  }))
