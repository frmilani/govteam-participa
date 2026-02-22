import { auth } from "@/auth"
import { redirect } from "next/navigation"

export async function getServerAuthSession() {
  return await auth()
}

export async function requireAuth() {
  const session = await getServerAuthSession()
  
  if (!session) {
    redirect("/auth/signin")
  }
  
  return session
}

export async function getOrganizationId() {
  const session = await requireAuth()
  
  console.log("[getOrganizationId] Session user:", {
    id: (session.user as any)?.id,
    email: (session.user as any)?.email,
    organizationId: (session.user as any)?.organizationId,
    isPlatformAdmin: (session.user as any)?.isPlatformAdmin
  })
  
  const organizationId = (session.user as any)?.organizationId
  
  if (!organizationId) {
    console.error("[getOrganizationId] organizationId não encontrado na sessão!")
    redirect("/auth/error?error=Configuration")
  }
  
  return organizationId as string
}
