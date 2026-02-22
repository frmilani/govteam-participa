import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      organizationId: string | null
      organizationName: string | null
      role: string | null
      isPlatformAdmin: boolean
      memberships: any[]
    } & DefaultSession["user"]
  }

  interface User {
    organizationId: string | null
    organizationName: string | null
    role: string | null
    isPlatformAdmin: boolean
    memberships: any[]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    organizationId: string | null
    organizationName: string | null
    role: string | null
    isPlatformAdmin: boolean
    memberships: any[]
  }
}
