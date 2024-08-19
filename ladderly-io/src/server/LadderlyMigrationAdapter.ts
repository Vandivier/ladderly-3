import { Prisma, PrismaClient, Session, User } from "@prisma/client";
import { Adapter, AdapterSession, AdapterUser } from "next-auth/adapters";

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
      const user = await prisma.user.findUnique({ where: { id } });
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
      const user = await prisma.user.update({ where: { id }, data });
      return adaptUser(user);
    },
    deleteUser: async (userId) => {
      const user = await prisma.user.delete({ where: { id: userId } });
      return adaptUser(user);
    },
    linkAccount: (data) => prisma.account.create({ data }),
    unlinkAccount: (provider_providerAccountId) =>
      prisma.account.delete({ where: { provider_providerAccountId } }),

    createSession: async (data) => {
      const session = await prisma.session.create({
        data: {
          ...data,
          handle: data.sessionToken,
          expiresAt: data.expires,
          userId: parseInt(data.userId, 10), // Convert string ID to number
        },
      });
      return adaptSession(session);
    },
    getSessionAndUser: async (sessionToken) => {
      const result = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      return result ? { session: result, user: adaptUser(result.user) } : null;
    },
    updateSession: (data) =>
      prisma.session.update({
        where: { sessionToken: data.sessionToken },
        data,
      }),
    deleteSession: (sessionToken) =>
      prisma.session.delete({ where: { sessionToken } }),
    createVerificationToken: (data) =>
      prisma.verificationToken.create({ data }),
    useVerificationToken: (identifier_token) =>
      prisma.verificationToken.delete({ where: { identifier_token } }),
  };
}

function adaptSession(session: Session): AdapterSession {
  return {
    sessionToken: session.sessionToken || session.handle, // Use handle if sessionToken is not available
    userId: session.userId?.toString() || "",
    expires: session.expiresAt || session.expires, // Use expiresAt if available, otherwise use expires
  };
}

// Helper function to adapt your User model to AdapterUser
function adaptUser(user: User): AdapterUser {
  return {
    id: user.id.toString(),
    name: user.name || null,
    email: user.email,
    emailVerified: user.emailVerified || null,
    image: user.image || null,
  };
}
