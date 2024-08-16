// types/next-auth.d.ts
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: number
    role: RoleEnum
  }

  interface Session {
    user: {
      id: number
      role: RoleEnum
    }
  }
}
