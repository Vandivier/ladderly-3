/**
 * @vitest-environment node
 *
 * Integration tests run against a live Next.js server and make real HTTP requests.
 * They require the 'node' environment (not jsdom) to use Node 22's native fetch.
 */
import { describe, expect, test, beforeEach } from 'vitest'

const APP_ORIGIN = process.env.APP_ORIGIN ?? 'http://127.0.0.1:3000'

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
  const url = path.startsWith('http') ? path : `${APP_ORIGIN}${path}`
  const headers = new Headers(init.headers)
  const cookieValue = jar?.headerValue()
  if (cookieValue) {
    headers.set('cookie', cookieValue)
  }
  const response = await fetch(url, { ...init, headers })
  jar?.storeFrom(response)
  return response
}

// Better-auth sign up endpoint
async function signUp(options: {
  email: string
  password: string
  name?: string
  ip?: string
}) {
  const { email, password, name = 'Test User', ip } = options
  const headers = new Headers({ 'Content-Type': 'application/json' })
  if (ip) {
    headers.set('x-forwarded-for', ip)
  }

  return fetch(`${APP_ORIGIN}/api/auth/sign-up/email`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password, name }),
  })
}

// Better-auth sign in endpoint
async function signIn(options: {
  email: string
  password: string
  ip?: string
  jar?: CookieJar
}) {
  const { email, password, ip, jar = new CookieJar() } = options
  const headers = new Headers({ 'Content-Type': 'application/json' })
  if (ip) {
    headers.set('x-forwarded-for', ip)
  }
  const cookieValue = jar.headerValue()
  if (cookieValue) {
    headers.set('cookie', cookieValue)
  }

  const response = await fetch(`${APP_ORIGIN}/api/auth/sign-in/email`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password }),
  })
  jar.storeFrom(response)
  return response
}

const randomEmail = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.round(Math.random() * 10_000)}@example.com`

// Pre-seeded verified test user (created by scripts/seedIntegrationTestUser.ts)
const VERIFIED_TEST_USER = {
  email: 'verified-test-user@example.com',
  password: 'TestP@ssword123',
}

describe.sequential('Authentication integration tests', () => {
  const jar = new CookieJar()

  beforeEach(() => {
    jar.clear()
  })

  test('allows sign-in with verified email and creates session', async () => {
    // Use unique IP to isolate from other tests' rate limits
    const testIp = '10.0.0.10'

    // Sign in with pre-seeded verified user
    const signInResponse = await signIn({
      email: VERIFIED_TEST_USER.email,
      password: VERIFIED_TEST_USER.password,
      jar,
      ip: testIp,
    })

    if (!signInResponse.ok) {
      const errorBody = await signInResponse.text()
      console.error(
        `Sign-in failed: ${signInResponse.status} ${signInResponse.statusText}`,
        errorBody,
      )
    }
    expect(signInResponse.ok).toBe(true)

    // Verify session was created
    const sessionResponse = await fetchWithCookies(
      '/api/auth/get-session',
      { headers: { Accept: 'application/json' } },
      jar,
    )
    expect(sessionResponse.status).toBe(200)
    const session = (await sessionResponse.json()) as {
      user?: { email?: string }
    }
    expect(session?.user?.email).toBe(VERIFIED_TEST_USER.email)
  }, 60_000)

  test('allows successful registration (email verification required for login)', async () => {
    // Use unique IP to isolate from other tests' rate limits
    const testIp = '10.0.0.1'
    const email = randomEmail('signup')
    const password = 'Str0ngP@ssword42'

    // Sign up should succeed
    const signUpResponse = await signUp({ email, password, ip: testIp })
    expect(signUpResponse.ok).toBe(true)

    // Sign in should fail because email is not verified (requireEmailVerification: true)
    const signInResponse = await signIn({ email, password, jar, ip: testIp })
    // better-auth returns 403 for unverified email
    expect(signInResponse.status).toBe(403)
  }, 60_000)

  test('enforces rate limit for repeated failures with the same account', async () => {
    // Use unique IP to isolate from other tests' rate limits
    const testIp = '10.0.0.2'
    const email = randomEmail('ratelimit-email')
    const password = 'Corr3ctPassword!'

    // Sign up first
    await signUp({ email, password, ip: testIp })

    // Make failed login attempts (wrong password)
    for (let i = 0; i < 3; i++) {
      const response = await signIn({
        email,
        password: 'WrongPassword!',
        ip: testIp,
      })
      // Better-auth returns 401 for invalid credentials
      expect(response.status).toBe(401)
    }

    // The 4th attempt should be rate limited
    const blockedResponse = await signIn({
      email,
      password: 'WrongPassword!',
      ip: testIp,
    })
    expect(blockedResponse.status).toBe(429)
  }, 60_000)

  test('blocks password spray attempts coming from the same IP address', async () => {
    const attackerIp = '203.0.113.55'

    // Make login attempts with different emails from same IP
    for (let i = 0; i < 3; i++) {
      const response = await signIn({
        email: randomEmail(`spray-${i}`),
        password: 'WrongPassword!',
        ip: attackerIp,
      })
      // Better-auth returns 401 for invalid credentials (user not found)
      expect(response.status).toBe(401)
    }

    // The 4th attempt should be rate limited by IP
    const blockedResponse = await signIn({
      email: randomEmail('spray-blocked'),
      password: 'WrongPassword!',
      ip: attackerIp,
    })
    expect(blockedResponse.status).toBe(429)
  }, 60_000)
})
