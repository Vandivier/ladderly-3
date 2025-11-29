import { describe, expect, it, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware, emailAttempts, MAX_ATTEMPTS_PER_EMAIL } from '~/middleware'

function createSignInRequest(email: string): NextRequest {
  return new NextRequest('http://localhost:3000/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
}

describe('middleware email rate limiting', () => {
  beforeEach(() => {
    emailAttempts.clear()
  })

  it('allows a single request without triggering rate limit', async () => {
    const request = createSignInRequest('test@example.com')
    const response = await middleware(request)

    expect(response.status).not.toBe(429)
  })

  it('blocks after MAX_ATTEMPTS_PER_EMAIL + 1 requests', async () => {
    const email = 'blocked@example.com'

    // Make MAX_ATTEMPTS_PER_EMAIL requests (should all pass)
    for (let i = 0; i < MAX_ATTEMPTS_PER_EMAIL; i++) {
      const request = createSignInRequest(email)
      const response = await middleware(request)
      expect(response.status).not.toBe(429)
    }

    // The next request should be blocked
    const blockedRequest = createSignInRequest(email)
    const blockedResponse = await middleware(blockedRequest)

    expect(blockedResponse.status).toBe(429)
    const body = await blockedResponse.json()
    expect(body.error).toContain('Too many login attempts')
  })
})
