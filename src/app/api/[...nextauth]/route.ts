import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import db from 'db'
import { AuthenticationError, Ctx } from 'blitz'

const handler = (req, res) =>
  NextAuth(req, res, {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ],
    adapter: PrismaAdapter(db),
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async signIn({ user, account, profile }) {
        const blitzCtx = req.blitzCtx as Ctx

        if (!user.email) {
          throw new AuthenticationError('Cannot find valid email')
        }

        if (profile?.image) {
          await db.user.update({
            where: { email: user.email },
            data: { profilePicture: profile.image },
          })
        }

        if (!blitzCtx.session.userId) {
          await blitzCtx.session.$create({
            userId: Number(user.id),
            role: user.role,
          })
        }

        return true
      },
      async session({ session, token, user }) {
        const blitzCtx = req.blitzCtx as Ctx
        session.user.id = Number(user.id)
        session.user.role = user.role

        if (!blitzCtx.session.userId) {
          await blitzCtx.session.$create({
            userId: Number(user.id),
            role: user.role,
          })
        }

        return session
      },
    },
  })

export { handler as GET, handler as POST }
