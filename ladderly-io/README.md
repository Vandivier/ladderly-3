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

### Two-Tier Rate Limiting System

This application implements a two-tier rate limiting system to protect against abuse while maintaining good user experience:

#### 1. Global Rate Limiting (All API Endpoints)

- **Purpose**: General API abuse protection for all tRPC procedures
- **Tracking**: By userId (if authenticated) or IP address (if not)
- **Limits**:
  - All users: 30 requests per minute
- **Implementation**: Applied automatically via tRPC middleware to all `publicProcedure` and `protectedProcedure` calls
- **Location**: `src/server/api/trpc.ts` - `rateLimitMiddleware`

#### 2. Auth-Specific Rate Limiting (Sensitive Operations)

- **Purpose**: Prevent brute force attacks and password spray attacks on authentication endpoints
- **Tracking**: By email address OR IP address (whichever limit is hit first)
- **Limits**:
  - Login: 3 failed attempts per hour (by email OR IP)
  - Signup: 3 attempts per hour (by email OR IP)
  - Password reset: 3 attempts per hour (by userId OR IP)
- **Whole-Service Limit**: 10 auth operations per minute per IP (prevents DDoS across all auth endpoints)
- **Implementation**: Applied manually before expensive operations (database queries, password verification) in auth flows
- **Location**: `src/server/utils/rateLimit.ts` - `checkGuestRateLimit()`

#### Why Two Tiers?

1. **Different Scopes**: Global protects all endpoints; auth-specific protects sensitive operations
2. **Different Limits**: Auth operations need stricter limits (3 per hour vs 30 per minute) to prevent brute force attacks
3. **Different Tracking**: Global uses IP/userId; auth uses email OR IP to prevent both targeted attacks (email-based) and password spray attacks (IP-based)
4. **Defense in Depth**: Multiple layers of protection provide better security
5. **DDoS Protection**: Whole-service auth limit (10/min) prevents distributed attacks across all auth endpoints

Both systems use in-memory caching with automatic cleanup to prevent memory leaks. In production, consider migrating to Redis or another distributed cache for multi-instance deployments.

### Email Verification Gating

This application requires email verification for all user-facing write operations and sensitive read operations:

- **Purpose**: Ensure users have verified their email address before accessing protected features
- **Implementation**: Opt-in via `protectedProcedureWithVerifiedEmail` procedure
- **Coverage**: 42 endpoints across User Management, Journal & Practice, Checklists, Learning & Assessment, AI Chat, and Job Search Management
- **Exemptions**: `auth.sendVerificationEmail` uses `protectedProcedureWithoutEmailVerification` to allow users to request verification emails
- **Location**: `src/server/api/trpc.ts` - `protectedProcedureWithVerifiedEmail`
- **User Experience**: Unverified users see a modal prompting email verification; closing the modal logs them out
