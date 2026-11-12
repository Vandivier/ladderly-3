import { describe, expect, it } from 'vitest'
import {
  NOELLE_GOFUNDME_URL,
  getVanityRedirects,
} from '~/vanity-redirects.js'

describe('getVanityRedirects', () => {
  it('forwards all Noelle vanity routes to the GoFundMe page', () => {
    const redirects = getVanityRedirects()
    const sources = redirects.map((r) => r.source)

    expect(sources).toEqual(['/noelle', '/noel', '/fcancer', '/f-cancer'])
    for (const redirect of redirects) {
      expect(redirect.destination).toBe(NOELLE_GOFUNDME_URL)
      expect(redirect.permanent).toBe(false)
    }
  })
})
