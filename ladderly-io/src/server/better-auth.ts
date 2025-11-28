import { env } from '~/env'
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { sendForgotPasswordEmail } from '~/server/mailers/forgotPasswordMailer'
import { sendVerificationEmail } from './mailers/verifyEmailMailer'
import { db } from './db'
import * as argon2 from 'argon2'
import { customSession } from 'better-auth/plugins'
import { type PaymentTierEnum } from '@prisma/client'

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, token, url: _url }) => {
      try {
        await sendForgotPasswordEmail({ to: user.email, token })
      } catch {
        throw new Error("Failed to send reset email")
      }
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url: _url, token }, _request) => {
      await sendVerificationEmail({ to: user.email, token })
    }
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID!,
      clientSecret: env.GITHUB_CLIENT_SECRET!,
    },
    discord: {
      clientId: env.DISCORD_CLIENT_ID!,
      clientSecret: env.DISCORD_CLIENT_SECRET!,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
    }
  },
  user: {
    fields: {
      emailVerified: "emailVerified"
    }
  },
  session: {
    fields: {
      token: "sessionToken",
      expiresAt: "expires"
    }
  },
  account: {
    fields: {
      providerId: "provider",
      accountId: "providerAccountId",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      accessTokenExpiresAt: "expires_at",
      idToken: "id_token",
      scope: "scope"
    }
  },
  verification: {
    modelName: "verificationToken",
    fields: {
      value: "token",
      expiresAt: "expires",
      identifier: "identifier"
    }
  },
  advanced: {
    database: {
      useNumberId: true
    }
  },
  rateLimit: {
    enabled: true,
    window: 60 * 60 * 1000,
    max: 100,
    customRules: {
      "/login": { window: 60 * 60 * 1000, max: 3 },
      "/forgot-password": { window: 60 * 60 * 1000, max: 3 },
      "/reset-password": { window: 60 * 60 * 1000, max: 3 }
    }
  },
  password: {
    async hash(plaintext: string) {
      return argon2.hash(plaintext)
    },
    async verify(hash: string, plaintext: string): Promise<boolean> {
      return argon2.verify(hash, plaintext)
    }
  },
  plugins: [
    customSession(async ({ user, session }) => {
      if (user?.id) {
        const sub = await db.subscription.findFirst({
          where: { userId: Number(user.id), type: "ACCOUNT_PLAN" },
          select: { tier: true, type: true },
        })

        return {
          user: {
            ...user,
            subscription: sub ?? { tier: "FREE", type: "ACCOUNT_PLAN" }
          },
          session
        }
      }
      return { user, session }
    })
  ],
  trustedOrigins: [process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"]
})

type BaseUser = typeof auth.$Infer.Session['user']
type BaseSession = typeof auth.$Infer.Session['session']

export type LadderlyClientSession = typeof auth.$Infer.Session
export type LadderlyServerSession = {
  user: BaseUser & {
    subscription?: {
      tier: PaymentTierEnum,
      type: string,
    }
  },
  session?: BaseSession
} | null