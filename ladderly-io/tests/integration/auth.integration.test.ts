import { describe, expect, test, beforeEach } from 'vitest'

const APP_ORIGIN = process.env.APP_ORIGIN ?? 'http://127.0.0.1:3000'

type NodeFetchModule = typeof import('node-fetch')

let nodeFetchModulePromise: Promise<NodeFetchModule> | null = null

async function ensureHttpGlobals(): Promise<{
  fetchFn: typeof fetch
  HeadersCtor: typeof Headers
}> {
  const needsFetch = typeof globalThis.fetch !== 'function'
  const needsHeaders = typeof globalThis.Headers !== 'function'

  if (needsFetch || needsHeaders) {
    nodeFetchModulePromise ??= import('node-fetch')
    const nodeFetch = await nodeFetchModulePromise

    if (typeof globalThis.fetch !== 'function') {
      const candidate =
        nodeFetch.default ??
        (nodeFetch as unknown as { fetch?: typeof fetch }).fetch
      if (!candidate) {
        throw new Error('Unable to resolve fetch implementation')
      }
      globalThis.fetch = candidate.bind(globalThis) as typeof fetch
    }

    if (typeof globalThis.Headers !== 'function' && nodeFetch.Headers) {
      globalThis.Headers = nodeFetch.Headers as unknown as typeof Headers
    }
  }

  const fetchFn =
    typeof globalThis.fetch === 'function' ? globalThis.fetch : null
  const HeadersCtor =
    typeof globalThis.Headers === 'function' ? globalThis.Headers : null

  if (!fetchFn || !HeadersCtor) {
    throw new Error(
      'Global fetch/Headers not available. Node 18+ or node-fetch is required.',
    )
  }

  return { fetchFn: fetchFn.bind(globalThis), HeadersCtor }
}

class CookieJar {
  private cookies = new Map<string, string>()

  storeFrom(response: Response) {
    const setCookies = getSetCookieHeaders(response)
    for (const cookie of setCookies) {
      const [name, ...rest] = cookie.split(';')[0]?.split('=') ?? []
      if (!name || rest.length === 0) continue
      this.cookies.set(name.trim(), rest.join('=').trim())
    }
  }

  headerValue() {
    if (this.cookies.size === 0) {
      return undefined
    }
    return Array.from(this.cookies.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join('; ')
  }

  clear() {
    this.cookies.clear()
  }
}

function getSetCookieHeaders(response?: Response) {
  if (!response) {
    return []
  }

  const headerLike = response.headers as Headers & {
    getSetCookie?: () => string[]
  }
  const cookies = headerLike.getSetCookie?.()
  if (cookies?.length) {
    return cookies
  }
  const single = response.headers.get('set-cookie')
  return single ? [single] : []
}

async function fetchWithCookies(
  path: string,
  init: RequestInit = {},
  jar?: CookieJar,
) {
  const { fetchFn, HeadersCtor } = await ensureHttpGlobals()
  const url = path.startsWith('http') ? path : `${APP_ORIGIN}${path}`
  const headers = new HeadersCtor(init.headers)
  const cookieValue = jar?.headerValue()
  if (cookieValue) {
    headers.set('cookie', cookieValue)
  }
  const response = await fetchFn(url, { ...init, headers })
  jar?.storeFrom(response)
  return response
}

async function loginWithCredentials(options: {
  email: string
  password: string
  ip?: string
  jar?: CookieJar
}) {
  const { email, password, ip, jar = new CookieJar() } = options
  const { HeadersCtor } = await ensureHttpGlobals()
  const sharedHeaders = new HeadersCtor()
  if (ip) {
    sharedHeaders.set('x-forwarded-for', ip)
  }

  const csrfResponse = await fetchWithCookies(
    '/api/auth/csrf',
    { method: 'GET', headers: sharedHeaders },
    jar,
  )
  if (!csrfResponse.ok) {
    const body = await csrfResponse.text()
    throw new Error(
      `Failed to load CSRF token (${csrfResponse.status}): ${body}`,
    )
  }
  const csrfBody = (await csrfResponse.json()) as { csrfToken: string }

  const formBody = new URLSearchParams({
    csrfToken: csrfBody.csrfToken,
    email,
    password,
    callbackUrl: '/',
    json: 'true',
  })

  const loginHeaders = new HeadersCtor(sharedHeaders)
  loginHeaders.set('Content-Type', 'application/x-www-form-urlencoded')

  return fetchWithCookies(
    '/api/auth/callback/credentials?json=true',
    {
      method: 'POST',
      headers: loginHeaders,
      body: formBody.toString(),
    },
    jar,
  )
}

const randomEmail = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.round(Math.random() * 10_000)}@example.com`

type TrpcSuccess<T> = {
  result?: {
    data?: {
      json?: T
    }
  }
}

type TrpcError = {
  error?: {
    message?: string
  }
}

type TrpcEnvelope<T> = TrpcSuccess<T> & TrpcError

async function callTrpc<TInput, TOutput>({
  path,
  input,
  ip,
}: {
  path: string
  input: TInput
  ip?: string
}) {
  const { fetchFn, HeadersCtor } = await ensureHttpGlobals()
  const headers = new HeadersCtor({
    'Content-Type': 'application/json',
    'x-trpc-source': 'integration-tests',
  })
  if (ip) {
    headers.set('x-forwarded-for', ip)
  }

  const response = await fetchFn(`${APP_ORIGIN}/api/trpc/${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      0: { json: input },
    }),
  })
  const raw = await response.text()

  if (!raw) {
    throw new Error(
      `tRPC ${path} returned empty response (status ${response.status})`,
    )
  }

  const parsed = JSON.parse(raw) as
    | TrpcEnvelope<TOutput>
    | TrpcEnvelope<TOutput>[]

  const payload = Array.isArray(parsed) ? parsed[0] : parsed

  if (payload?.error) {
    throw new Error(payload.error.message ?? 'Unknown tRPC error')
  }

  return payload?.result?.data?.json as TOutput
}

describe.sequential('Authentication integration tests', () => {
  const jar = new CookieJar()

  beforeEach(() => {
    jar.clear()
  })

  test('allows successful registration and login', async () => {
    const email = randomEmail('signup')
    const password = 'Str0ngP@ssword42'

    await callTrpc({
      path: 'auth.signup',
      input: { email, password },
    })

    const loginResponse = await loginWithCredentials({
      email,
      password,
      jar,
    })
    expect(loginResponse.status).toBe(200)

    const sessionResponse = await fetchWithCookies(
      '/api/auth/session',
      { headers: { Accept: 'application/json' } },
      jar,
    )
    expect(sessionResponse.status).toBe(200)
    const session = (await sessionResponse.json()) as {
      user?: { email?: string }
    }
    expect(session?.user?.email).toBe(email)
  }, 60_000)

  test('enforces rate limit for repeated failures with the same account', async () => {
    const email = randomEmail('ratelimit-email')
    const password = 'Corr3ctPassword!'

    await callTrpc({
      path: 'auth.signup',
      input: { email, password },
    })

    for (let i = 0; i < 3; i++) {
      const response = await loginWithCredentials({
        email,
        password: 'WrongPassword!',
      })
      expect(response.status).toBe(401)
    }

    const blockedResponse = await loginWithCredentials({
      email,
      password: 'WrongPassword!',
    })
    const bodyText = await blockedResponse.text()
    expect(blockedResponse.status).toBeGreaterThanOrEqual(400)
    expect(bodyText).toContain('Too many login attempts')
  }, 60_000)

  test('blocks password spray attempts coming from the same IP address', async () => {
    const attackerIp = '203.0.113.55'

    for (let i = 0; i < 3; i++) {
      const response = await loginWithCredentials({
        email: randomEmail(`spray-${i}`),
        password: 'WrongPassword!',
        ip: attackerIp,
      })
      expect(response.status).toBe(401)
    }

    const blockedResponse = await loginWithCredentials({
      email: randomEmail('spray-blocked'),
      password: 'WrongPassword!',
      ip: attackerIp,
    })
    const bodyText = await blockedResponse.text()
    expect(blockedResponse.status).toBeGreaterThanOrEqual(400)
    expect(bodyText).toContain('Too many login attempts')
  }, 60_000)
})
