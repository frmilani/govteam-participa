//src/lib/auth.config.ts
import type { NextAuthConfig } from "next-auth"

const HUB_URL = process.env.HUB_URL
const HUB_INTERNAL_URL = process.env.HUB_INTERNAL_URL
const HUB_CLIENT_ID = process.env.HUB_CLIENT_ID
const HUB_CLIENT_SECRET = process.env.HUB_CLIENT_SECRET
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

// Log de diagnóstico (Verifique isso no seu terminal!)



if (!AUTH_SECRET) {
  console.warn("[Auth] WARNING: AUTH_SECRET is not defined in environment variables!")
}

export const authOptions = {
  // ⚠️ NÃO usar adapter para OAuth SSO - apenas JWT
  // adapter: PrismaAdapter(prisma) as any,
  secret: AUTH_SECRET,
  trustHost: true,
  providers: [
    {
      id: "hub",
      name: "FormBuilder Hub",
      type: "oauth",
      issuer: HUB_URL,
      clientId: HUB_CLIENT_ID,
      clientSecret: HUB_CLIENT_SECRET,
      authorization: {
        url: `${HUB_URL}/api/auth/oauth/authorize`,
        params: {
          scope: "openid profile email organization",
          response_type: "code",
        },
      },
      token: {
        url: `${HUB_INTERNAL_URL}/api/auth/oauth/token`,
      },
      userinfo: `${HUB_INTERNAL_URL}/api/auth/oauth/userinfo`,
      checks: ["state"], // Desabilitando PKCE pois o Hub não suporta no momento
      client: {
        token_endpoint_auth_method: "client_secret_post",
        id_token_signed_response_alg: "HS256",
      },
      profile(profile: any) {


        // No novo Hub, os dados principais vêm no topo ou dentro de memberships
        const organizationId = profile.org_id || profile.organizationId || profile.memberships?.[0]?.org_id
        const organizationName = profile.org_name || profile.organizationName || profile.memberships?.[0]?.org_name
        const role = profile.role || profile.memberships?.[0]?.role
        const isPlatformAdmin = !!profile.isPlatformAdmin

        // Super admins podem não ter organização vinculada
        if (!organizationId && !isPlatformAdmin) {
          console.error("[NextAuth] Error: Organization ID not found in profile data")
          throw new Error("Usuário sem organização vinculada no Hub.")
        }

        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture || profile.image,
          organizationId: organizationId || null,
          organizationName: organizationName || null,
          role: role || (isPlatformAdmin ? "Super Admin" : null),
          isPlatformAdmin: isPlatformAdmin,
          memberships: profile.memberships || []
        }
      },
    },
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {


      // Sempre permitir login via OAuth
      return true
    },
    async redirect({ url, baseUrl }: any) {

      // Se a URL já é absoluta e começa com baseUrl, use-a
      if (url.startsWith(baseUrl)) return url
      // Se começa com /, é relativa ao baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Se é uma URL externa, redirecione para o baseUrl
      return baseUrl
    },
    async jwt({ token, user, account, profile }: any) {
      if (user && profile) {
        // IMPORTANT: NextAuth v5 generates its own UUID for user.id, ignoring
        // the id returned by profile(). We MUST use profile.sub directly.
        const hubUserId = profile.sub


        token.hubUserId = hubUserId
        token.sub = hubUserId
        token.email = user.email
        token.name = user.name
        token.organizationId = profile.org_id || user.organizationId
        token.organizationName = profile.org_name || user.organizationName
        token.role = profile.role || user.role
        token.isPlatformAdmin = !!profile.isPlatformAdmin
        token.memberships = profile.memberships || user.memberships
      } else if (!token.hubUserId) {
        console.warn("[JWT Callback] Token missing hubUserId, invalidating session")
        return {}
      }

      return token
    },
    async session({ session, token }: any) {
      if (session && session.user && token) {
        Object.assign(session.user, {
          id: token.hubUserId,
          email: token.email,
          name: token.name,
          organizationId: token.organizationId,
          organizationName: token.organizationName,
          role: token.role,
          isPlatformAdmin: token.isPlatformAdmin,
          memberships: token.memberships
        })


      }

      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt" as const,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token.spoke-participa`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url.spoke-participa`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token.spoke-participa`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    pkceCodeVerifier: {
      name: `next-auth.pkce.code_verifier.spoke-participa`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    state: {
      name: `next-auth.state.spoke-participa`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
} satisfies NextAuthConfig
