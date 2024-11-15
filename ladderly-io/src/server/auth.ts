import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import { PaymentTierEnum } from "@prisma/client";

import { env } from "~/env";
import { db } from "~/server/db";
import { LadderlyMigrationAdapter } from "./LadderlyMigrationAdapter";

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

export const authOptions: NextAuthOptions = {
  callbacks: {
    session: async ({ session, user }): Promise<LadderlySession> => {
      const dbUser = await db.user.findUnique({
        where: { id: parseInt(user.id) },
        include: {
          subscriptions: {
            where: { type: 'ACCOUNT_PLAN' },
            select: { tier: true, type: true },
          },
        },
      });

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

      return {
        ...session,
        user: userData,
      };
    },
    signIn: async ({ user, account, profile, email, credentials }) => {
      // If the user exists but doesn't have an account for this provider
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
            });
          }

          return true;
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
  ].filter(Boolean) as NextAuthOptions["providers"],
};

export const getServerAuthSession = () => 
  getServerSession(authOptions) as Promise<LadderlySession | null>;
