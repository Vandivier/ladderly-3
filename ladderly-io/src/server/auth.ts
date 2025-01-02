/* TODO:
 * let's abandon compatability with blitz.js passwords and simply force users to reset passwords as part of this migration.
 * I'll mark user passwords as empty strings
 * If the user password in the DB is empty we will trigger the forgot password flow and inform the user
 * If the user password in the DB is populated, suggest a current best practice for node.js v20+
 * Using the argon2 package seems fine to me.
 */

import {
  getServerSession,
  Session,
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
import { JWT } from "next-auth/jwt";

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
  };
}

declare module "next-auth" {
  interface Session extends LadderlySession {}
}

// Helper function to verify password
async function verifyPassword(
  hashedPassword: string,
  plaintext: string
): Promise<boolean> {
  try {
    return await argon2.verify(hashedPassword, plaintext);
  } catch (error) {
    console.error("Password verification failed:", error);
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user, account }) => {
      // Initial sign in
      if (account && user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        // Add any additional user data you want to include in the token
        const dbUser = await db.user.findUnique({
          where: { id: parseInt(user.id) },
          include: {
            subscriptions: {
              where: { type: "ACCOUNT_PLAN" },
              select: { tier: true, type: true },
            },
          },
        });
        token.subscription = dbUser?.subscriptions[0] ?? {
          tier: PaymentTierEnum.FREE,
          type: "ACCOUNT_PLAN",
        };
      }
      return token;
    },
    session: async ({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<LadderlySession> => {
      // jwt() is executed first then session()
      const user = session.user as LadderlySession["user"];
      const userId = user?.id?.toString() ?? token.id?.toString() ?? null;
      const newSession: LadderlySession = {
        ...session,
        user: userId
          ? {
              id: userId,
              email: session.user?.email ?? token.email?.toString() ?? null,
              name: token.name?.toString() ?? null,
              image: token.picture?.toString() ?? null,
              subscription: token.subscription as {
                tier: PaymentTierEnum;
                type: string;
              },
            }
          : undefined,
      };

      return newSession;
    },
    signIn: async ({ user, account, profile, email, credentials }) => {
      // signIn is called by both social login and credentials login

      if (account?.provider && user.email) {
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
          include: { accounts: true },
        });

        if (existingUser) {
          const existingAccount = existingUser.accounts.find(
            (acc) => acc.provider === account.provider
          );

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
            console.log(
              `New Account Created with User ID: ${existingUser.id} and Account ID: ${newAccount.id}`
            );
          }
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
        email: {
          label: "Email",
          type: "email",
          placeholder: "your-email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email ?? !credentials?.password) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
          });
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }

        if (!user.hashedPassword) {
          // Trigger password reset flow
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message:
              "Password reset required. Please check your email to reset your password.",
          });
        }

        try {
          const isValid = await verifyPassword(
            user.hashedPassword,
            credentials.password
          );

          if (!isValid) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Invalid email or password",
            });
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: `${user.nameFirst} ${user.nameLast}`.trim() ?? null,
            image: user.image ?? null,
          };
        } catch (error) {
          console.error("Password verification failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "An error occurred during authentication. " +
              "You may need to reset your password. " +
              "If the issue persists, please contact support at admin@ladderly.io or through Discord.",
          });
        }
      },
    }),
  ].filter(Boolean) as NextAuthOptions["providers"],
};

export const getServerAuthSession = () =>
  getServerSession(authOptions) as Promise<LadderlySession | null>;
