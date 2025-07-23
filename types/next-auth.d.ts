
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      isActive: boolean
      loginTime?: number
      lastActivity?: number
    }
    sessionToken?: string
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    isActive: boolean
    loginTime?: number
    lastActivity?: number
    expired?: boolean
    inactive?: boolean
    accountDeactivated?: boolean
    sessionToken?: string
  }
}
