import { Account, Prisma, PrismaClient, Session, User } from "@prisma/client";
import {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
} from "next-auth/adapters";
import { ProviderType } from "next-auth/providers/index";

export function LadderlyMigrationAdapter(prisma: PrismaClient): Adapter {
  return {
    createUser: async (data) => {
      const prismaUserData: Prisma.UserCreateInput = {
        name: data.name ?? undefined,
        email: data.email,
        emailVerified: data.emailVerified,
        image: data.image ?? null,
        nameFirst: data.name?.split(" ")[0] ?? undefined,
        nameLast: data.name?.split(" ").slice(1).join(" ") ?? undefined,
        emailBackup: data.email ?? "",
        emailStripe: data.email ?? "",
      };

      const user = await prisma.user.create({ data: prismaUserData });
      return adaptUser(user);
    },
    getUser: async (id) => {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
      });
      return user ? adaptUser(user) : null;
    },
    getUserByEmail: async (email) => {
      const user = await prisma.user.findUnique({ where: { email } });
      return user ? adaptUser(user) : null;
    },
    getUserByAccount: async (provider_providerAccountId) => {
      const account = await prisma.account.findUnique({
        where: { provider_providerAccountId },
        include: { user: true },
      });
      return account?.user ? adaptUser(account.user) : null;
    },
    updateUser: async ({ id, ...data }) => {
      const maybeName = data.name;
      const userUpdatedInput: Prisma.UserUpdateInput = {
        ...data,
        name: maybeName ?? "",
      };

      const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: userUpdatedInput,
      });
      return adaptUser(user);
    },
    deleteUser: async (userId) => {
      const user = await prisma.user.delete({
        where: { id: parseInt(userId) },
      });
      return adaptUser(user);
    },
    linkAccount: async (account) => {
      const prismaAccountData: Prisma.AccountCreateInput = {
        provider: account.provider,
        type: account.type,
        providerAccountId: account.providerAccountId,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state,
        refresh_token: account.refresh_token,
        user: {
          connect: { id: parseInt(account.userId) },
        },
      };

      const createdAccount = await prisma.account.create({
        data: prismaAccountData,
      });

      return adaptAccount(createdAccount);
    },
    unlinkAccount: async (provider_providerAccountId) => {
      const account = await prisma.account.delete({
        where: { provider_providerAccountId },
      });
      return account ? adaptAccount(account) : undefined;
    },
    createSession: async (data) => {
      const session = await prisma.session.create({
        data: {
          ...data,
          handle: data.sessionToken,
          expiresAt: data.expires,
          userId: parseInt(data.userId),
        },
      });
      return adaptSession(session);
    },
    getSessionAndUser: async (sessionToken) => {
      const result = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      return result?.user
        ? { session: adaptSession(result), user: adaptUser(result.user) }
        : null;
    },
    updateSession: async (data) => {
      const { sessionToken, ...updateData } = data;

      const prismaUpdateData: Prisma.SessionUpdateInput = {
        expires: updateData.expires,
        expiresAt: updateData.expires,
      };

      const updatedSession = await prisma.session.update({
        where: { sessionToken },
        data: prismaUpdateData,
      });

      return adaptSession(updatedSession);
    },
    deleteSession: async (sessionToken) => {
      await prisma.session.delete({ where: { sessionToken } });
    },
    createVerificationToken: (data) =>
      prisma.verificationToken.create({ data }),
    useVerificationToken: (identifier_token) =>
      prisma.verificationToken.delete({ where: { identifier_token } }),
  };
}

function adaptSession(session: Session): AdapterSession {
  return {
    sessionToken: session.sessionToken || session.handle,
    userId: session.userId?.toString() ?? "",
    expires: session.expiresAt || session.expires,
  };
}

function adaptUser(user: User): AdapterUser {
  return {
    id: user.id.toString(),
    name: user.name || null,
    email: user.email,
    emailVerified: user.emailVerified || null,
    image: user.image || null,
  };
}

function adaptAccount(account: Account): AdapterAccount {
  return {
    userId: account.userId.toString(),
    type: account.type as ProviderType,
    provider: account.provider,
    providerAccountId: account.providerAccountId,
    refresh_token: account.refresh_token ?? undefined,
    access_token: account.access_token ?? undefined,
    expires_at: account.expires_at ?? undefined,
    token_type: account.token_type ?? undefined,
    scope: account.scope ?? undefined,
    id_token: account.id_token ?? undefined,
    session_state: account.session_state ?? undefined,
  };
}
