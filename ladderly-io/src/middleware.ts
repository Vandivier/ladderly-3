import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// In-memory tracking for per-email rate limiting
export const emailAttempts = new Map<
  string,
  { count: number; expiresAt: number }
>()

export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
export const MAX_ATTEMPTS_PER_EMAIL = 3

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      const now = Date.now()
      for (const [email, data] of emailAttempts.entries()) {
        if (data.expiresAt < now) {
          emailAttempts.delete(email)
        }
      }
    },
    5 * 60 * 1000,
  )
}

export async function middleware(request: NextRequest) {
  // Only apply to better-auth sign-in endpoint
  if (
    request.nextUrl.pathname === '/api/auth/sign-in/email' &&
    request.method === 'POST'
  ) {
    try {
      // Clone the request to read the body
      const body = await request.clone().json()
      const email = body?.email?.toLowerCase()

      if (email) {
        const now = Date.now()
        const existing = emailAttempts.get(email)

        if (existing && existing.expiresAt > now) {
          if (existing.count >= MAX_ATTEMPTS_PER_EMAIL) {
            return NextResponse.json(
              {
                error:
                  'Too many login attempts for this email. Please wait before trying again.',
              },
              {
                status: 429,
                headers: {
                  'X-Retry-After': String(
                    Math.ceil((existing.expiresAt - now) / 1000),
                  ),
                },
              },
            )
          }
          existing.count++
        } else {
          emailAttempts.set(email, {
            count: 1,
            expiresAt: now + RATE_LIMIT_WINDOW_MS,
          })
        }
      }
    } catch {
      // If we can't parse the body, let the request through
      // Better-auth will handle validation
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/auth/:path*',
}
