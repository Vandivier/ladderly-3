/* TODO:
 * let's abandon compatability with blitz.js passwords and simply force users to reset passwords as part of this migration.
 * I'll mark user passwords as empty strings
 * If the user password in the DB is empty we will trigger the forgot password flow and inform the user
 * If the user password in the DB is populated, suggest a current best practice for node.js v20+
 * Using the argon2 package seems fine to me.
 */

import {
  getServerSession,
  type Session,
  type DefaultSession,
  type NextAuthOptions,
} from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PaymentTierEnum } from '@prisma/client'
import * as argon2 from 'argon2'

import { env } from '~/env'
import { db } from '~/server/db'
import { LadderlyMigrationAdapter } from './LadderlyMigrationAdapter'
import type { JWT } from 'next-auth/jwt'
import {
  checkGuestRateLimit,
  recordFailedLoginAttempt,
} from './utils/rateLimit'

export interface LadderlySession extends DefaultSession {
  user?: {
    id: string
    subscription: {
      tier: PaymentTierEnum
      type: string
    }
    email: string | null
    name: string | null
    image?: string | null
  }
}

declare module 'next-auth' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Session extends LadderlySession {}
}

// Helper function to verify password
async function verifyPassword(
  hashedPassword: string,
  plaintext: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hashedPassword, plaintext)
  } catch (error) {
    console.error('Password verification failed:', error)
    return false
  }
}

const AUTH_ERROR_MESSAGE =
  'An error occurred during authentication. ' +
  'You may need to reset your password. ' +
  'If the issue persists, please contact support at admin@ladderly.io or through Discord.'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt: async ({ token, user, account }) => {
      // Initial sign in
      if (account && user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
        // Add any additional user data you want to include in the token
        const dbUser = await db.user.findUnique({
          where: { id: parseInt(user.id) },
          include: {
            subscriptions: {
              where: { type: 'ACCOUNT_PLAN' },
              select: { tier: true, type: true },
            },
          },
        })
        token.subscription = dbUser?.subscriptions[0] ?? {
          tier: PaymentTierEnum.FREE,
          type: 'ACCOUNT_PLAN',
        }
      }
      return token
    },
    session: async ({
      session,
      token,
    }: {
      session: Session
      token: JWT
    }): Promise<LadderlySession> => {
      // jwt() is executed first then session()
      const user = session.user as LadderlySession['user']
      const userId = user?.id?.toString() ?? token.id?.toString() ?? null
      const newSession: LadderlySession = {
        ...session,
        user: userId
          ? {
              id: userId,
              email: session.user?.email ?? token.email?.toString() ?? null,
              name: token.name?.toString() ?? null,
              image: token.picture?.toString() ?? null,
              subscription: token.subscription as {
                tier: PaymentTierEnum
                type: string
              },
            }
          : undefined,
      }

      return newSession
    },
    signIn: async ({ user, account }) => {
      // signIn is called by both social login and credentials login
      if (account?.provider && user.email) {
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
          include: { accounts: true },
        })

        if (existingUser) {
          const existingAccount = existingUser.accounts.find(
            (acc) => acc.provider === account.provider,
          )

          if (!existingAccount) {
            await db.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            })
          }
        } else {
          const newUser = await db.user.create({
            data: {
              email: user.email,
              emailVerified: new Date(),
              image: user.image,
              nameFirst: user.name?.split(' ')[0] ?? '',
              nameLast: user.name?.split(' ').slice(1).join(' ') ?? '',
              subscriptions: {
                create: {
                  tier: PaymentTierEnum.FREE,
                  type: 'ACCOUNT_PLAN',
                },
              },
              accounts: {
                create: {
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                },
              },
            },
          })
          console.log(`Created new user with email: ${newUser.email}`)
        }
      }

      return true
    },
  },
  adapter: LadderlyMigrationAdapter(db),
  providers: [
    env.DISCORD_CLIENT_ID && env.DISCORD_CLIENT_SECRET
      ? DiscordProvider({
          clientId: env.DISCORD_CLIENT_ID,
          clientSecret: env.DISCORD_CLIENT_SECRET,
        })
      : null,
    env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
      ? GithubProvider({
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
        })
      : null,
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? GoogleProvider({
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        })
      : null,

    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'your-email@example.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error(AUTH_ERROR_MESSAGE)
        }

        // Rate limiting BEFORE expensive operations (database query + password verification)
        // This prevents attackers from draining server resources with invalid login attempts
        // If rate limit exceeded, this will throw with a clear message before expensive operations
        await checkGuestRateLimit({
          db,
          email: credentials.email,
          action: 'login',
          errorMessage:
            'Too many login attempts. Please wait before trying again.',
        })

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          // Record failed login attempt for non-existent user
          recordFailedLoginAttempt(credentials.email)
          throw new Error(AUTH_ERROR_MESSAGE)
        }

        if (!user.hashedPassword) {
          // Record failed login attempt
          recordFailedLoginAttempt(credentials.email)
          // Trigger password reset flow
          throw new Error(
            'Password reset required. Please check your email to reset your password.',
          )
        }

        try {
          const isValid = await verifyPassword(
            user.hashedPassword,
            credentials.password,
          )

          if (!isValid) {
            // Record failed login attempt
            recordFailedLoginAttempt(credentials.email)
            throw new Error(AUTH_ERROR_MESSAGE)
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: `${user.nameFirst} ${user.nameLast}`.trim() ?? null,
            image: user.image ?? null,
          }
        } catch (error) {
          // Only catch unexpected errors from verifyPassword, not auth failures
          // If it's already an Error (like invalid password above), re-throw it
          if (error instanceof Error) {
            throw error
          }
          console.error('Password verification failed:', error)
          throw new Error(AUTH_ERROR_MESSAGE)
        }
      },
    }),
  ].filter(Boolean) as NextAuthOptions['providers'],
}

export async function getServerAuthSession(): Promise<LadderlySession | null> {
  return getServerSession(authOptions)
}
