# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

## FAQ and Architecture Notes

### Rate Limiting System

This application implements a multi-layered rate limiting strategy to protect against abuse:

#### 1. tRPC Global Rate Limiting

- **Purpose**: Protect all API endpoints from excessive requests
- **Implementation**: In-memory sliding window counter in `src/server/utils/rateLimit.ts`
- **Limit**: 30 requests per minute per identifier
- **Identifier**: Uses `userId` for authenticated users, falls back to IP address for unauthenticated requests
- **Error Response**: Throws tRPC `TOO_MANY_REQUESTS` error
- **Cleanup**: Stale entries removed every 5 minutes
- **Applied To**: All tRPC procedures via `rateLimitMiddleware` in `src/server/api/trpc.ts`

#### 2. Authentication Rate Limiting (better-auth)

- **Purpose**: Protect authentication endpoints from brute force attacks
- **Implementation**: Built-in better-auth rate limiter configured in `src/server/better-auth.ts`
- **Default Limit**: 100 requests per hour per IP
- **Sensitive Endpoints** (3 requests per hour per IP):
  - `/sign-in/email`
  - `/sign-up/email`
  - `/forgot-password`
  - `/reset-password`
  - `/verify-email`

#### 3. Per-Email Sign-In Rate Limiting (Middleware)

- **Purpose**: Prevent credential stuffing by limiting attempts per email address (complements IP-based limiting)
- **Implementation**: Next.js middleware in `src/middleware.ts`
- **Limit**: 3 login attempts per email per hour
- **Error Response**: HTTP 429 with `X-Retry-After` header
- **Cleanup**: Expired entries removed every 5 minutes

### Email Verification Gating

This application requires email verification for all user-facing write operations and sensitive read operations:

- **Purpose**: Ensure users have verified their email address before accessing protected features
- **Implementation**: Opt-in via `protectedProcedureWithVerifiedEmail` procedure
- **Coverage**: 42 endpoints across User Management, Journal & Practice, Checklists, Learning & Assessment, AI Chat, and Job Search Management
- **Exemptions**: `auth.sendVerificationEmail` uses `protectedProcedureWithoutEmailVerification` to allow users to request verification emails
- **Location**: `src/server/api/trpc.ts` - `protectedProcedureWithVerifiedEmail`
- **User Experience**: Unverified users see a modal prompting email verification; closing the modal logs them out
