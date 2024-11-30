/* TODO:
 * let's abandon compatability with blitz.js passwords and simply force users to reset passwords as part of this migration.
 * I'll mark user passwords as empty strings
 * If the user password in the DB is empty we will trigger the forgot password flow and inform the user
 * If the user password in the DB is populated, suggest a current best practice for node.js v20+
 * Using the argon2 package seems fine to me.
 */

import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import CredentialsProvider from "next-auth/providers/credentials";
import { PaymentTierEnum } from "@prisma/client";
import * as argon2 from "argon2";

import { env } from "~/env";
import { db } from "~/server/db";
import { LadderlyMigrationAdapter } from "./LadderlyMigrationAdapter";
import { TRPCError } from "@trpc/server";

export interface LadderlySession extends DefaultSession {
  user?: {
    id: string;
    subscription: {
      tier: PaymentTierEnum;
      type: string;
    };
    email: string | null;
    name: string | null;
    image?: string | null;
  }
}

declare module "next-auth" {
  interface Session extends LadderlySession {}
}

// Helper function to hash password
async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password);
}

// Helper function to verify password
async function verifyPassword(hashedPassword: string, plaintext: string): Promise<boolean> {
  try {
    return await argon2.verify(hashedPassword, plaintext);
  } catch (error) {
    console.error('Password verification failed:', error);
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    // TODO: this seems to work with google login, but not with credentials login
    session: async ({ session, user }): Promise<LadderlySession> => {
      console.log("Session Callback Triggered"); // TODO: delete this log
      console.log("Session:", session); // TODO: delete this log
      console.log("User:", user); // TODO: delete this log

      const dbUser = await db.user.findUnique({
        where: { id: parseInt(user.id) },
        include: {
          subscriptions: {
            where: { type: 'ACCOUNT_PLAN' },
            select: { tier: true, type: true },
          },
        },
      });

      console.log("Database User:", dbUser); // TODO: delete this log

      const subscription = dbUser?.subscriptions[0] || {
        tier: PaymentTierEnum.FREE,
        type: 'ACCOUNT_PLAN',
      };

      const userData = dbUser
        ? {
            email: dbUser.email,
            name: dbUser.name,
            image: dbUser.image,
            id: user.id,
            subscription,
          }
        : undefined;

      console.log("User Data for Session:", userData); // TODO: delete this log

      return {
        ...session,
        user: userData,
      };
    },
    signIn: async ({ user, account, profile, email, credentials }) => {
      if (account?.provider && user.email) {
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
          include: { accounts: true },
        });

        console.log("Existing User:", existingUser); // TODO: delete this log

        if (existingUser) {
          const existingAccount = existingUser.accounts.find(
            (acc) => acc.provider === account.provider
          );

          console.log("Existing Account:", existingAccount); // TODO: delete this log

          if (!existingAccount) {
            const newAccount = await db.account.create({
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
            });
            console.log(`New Account Created with User ID: ${existingUser.id} and Account ID: ${newAccount.id}`);
          }

          return true;
        } else {
          console.log(`User not found by email with User ID: ${user.id}`);
          return false;
        }
      }

      return true;
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
    env.LINKEDIN_CLIENT_ID && env.LINKEDIN_CLIENT_SECRET
      ? LinkedInProvider({
          authorization: {
            params: {
              scope: "openid profile email",
            },
          },
          clientId: env.LINKEDIN_CLIENT_ID,
          clientSecret: env.LINKEDIN_CLIENT_SECRET,
        })
      : null,
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your-email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid credentials',
          });
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid email or password',
          });
        }

        if (!user.hashedPassword) {
          // Trigger password reset flow
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Password reset required. Please check your email to reset your password.',
          });
        }

        try {
          const isValid = await verifyPassword(user.hashedPassword, credentials.password);
          
          if (!isValid) {
            throw new TRPCError({
              code: 'UNAUTHORIZED',
              message: 'Invalid email or password',
            });
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: `${user.nameFirst} ${user.nameLast}`.trim() || null,
            image: user.image || null,
          };
        } catch (error) {
          console.error('Password verification failed:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred during authentication',
          });
        }
      },
    }),
  ].filter(Boolean) as NextAuthOptions["providers"],
};

export const getServerAuthSession = () => 
  getServerSession(authOptions) as Promise<LadderlySession | null>;
