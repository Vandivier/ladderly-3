/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'

import { db } from '~/server/db'
import {
  checkGlobalRateLimit,
  getRateLimitIdentifier,
} from '~/server/utils/rateLimit'
import { auth, type LadderlyServerSession } from '../better-auth'

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({ headers: opts.headers })

  return {
    db,
    session: session as LadderlyServerSession,
    ...opts,
  }
}

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router

/**
 * Global rate limiting middleware for all tRPC procedures.
 * Rate limits by userId (if authenticated) or IP address (if not).
 */
const rateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  // Extract IP address from headers (common headers used by proxies)
  const forwardedFor = ctx.headers.get('x-forwarded-for')
  const realIp = ctx.headers.get('x-real-ip')
  const ipAddress = forwardedFor?.split(',')[0]?.trim() ?? realIp ?? 'unknown'

  // Get rate limit identifier (userId if authenticated, otherwise IP)
  const identifier = getRateLimitIdentifier(ctx.session?.user?.id, ipAddress)

  // Apply global rate limiting
  // Same limit for all users: 30 requests per minute
  checkGlobalRateLimit({
    identifier,
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
  })

  return next({ ctx })
})

/**
 * Middleware for timing procedure execution and adding an articifial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now()

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100
    await new Promise((resolve) => setTimeout(resolve, waitMs))
  }

  const result = await next()

  const end = Date.now()
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`)

  return result
})

/**
 * Hybrid procedure middleware that checks for a valid user session OR a secret
 * internal build key. This allows server-side processes like static
 * site generation to access protected data.
 *
 * NOTE: This middleware must be called AFTER .input() so it can inspect the input.
 */
export const isAuthedOrInternalMiddleware = t.middleware((opts) => {
  // For client-side calls, we verify the user's session.
  if (opts.ctx.session?.user) {
    return opts.next({
      ctx: {
        session: { ...opts.ctx.session, user: opts.ctx.session.user },
      },
    })
  }

  // For build-time calls, we verify a secret key from the procedure's input.
  const input = opts.input as { internalSecret?: string }
  const serverInternalSecret = process.env.NEXTAUTH_SECRET

  if (
    serverInternalSecret &&
    input?.internalSecret === serverInternalSecret &&
    serverInternalSecret.length > 0
  ) {
    return opts.next({ ctx: opts.ctx })
  }

  // If neither authentication method works, deny access.
  throw new TRPCError({ code: 'UNAUTHORIZED' })
})

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure
  .use(rateLimitMiddleware)
  .use(timingMiddleware)

/**
 * Protected (authenticated) procedure WITH email verification requirement
 *
 * If you want a query or mutation to ONLY be accessible to logged in users with verified emails,
 * use this. It verifies the session is valid, guarantees `ctx.session.user` is not null,
 * and requires email verification.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(rateLimitMiddleware)
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    // Require email verification for protected procedures
    if (!ctx.session.user.emailVerified) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message:
          'Please verify your email address to access this feature. Check your inbox for the verification email.',
      })
    }

    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
      },
    })
  })

/**
 * Protected (authenticated) procedure WITHOUT email verification requirement
 *
 * Use this ONLY for endpoints that must be accessible before email verification
 * (e.g., sending verification emails, viewing verification status).
 * Most endpoints should use `protectedProcedure` which requires email verification.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedureWithoutEmailVerification = t.procedure
  .use(rateLimitMiddleware)
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }
    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
      },
    })
  })

/**
 * Protected (authenticated) procedure WITH email verification requirement
 *
 * This is now an alias for `protectedProcedure` since all protected procedures
 * require email verification by default.
 *
 * @deprecated Use `protectedProcedure` instead - it now requires email verification.
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedureWithVerifiedEmail = protectedProcedure
