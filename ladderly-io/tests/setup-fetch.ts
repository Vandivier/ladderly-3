import fetch, { Headers } from 'node-fetch'

if (typeof globalThis.fetch !== 'function') {
  globalThis.fetch = fetch as unknown as typeof globalThis.fetch
}

if (typeof globalThis.Headers !== 'function') {
  globalThis.Headers = Headers as unknown as typeof globalThis.Headers
}
