"use client"

import { useSession } from "next-auth/react"

export function useAuth() {
  const { data: session, status } = useSession()
  
  const user = session?.user as any
  const organizationId = user?.organizationId
  const organizationName = user?.organizationName
  const role = user?.role
  const isAdmin = role === "ORG_ADMIN" || role === "SUPER_ADMIN"
  
  return {
    session,
    status,
    organizationId,
    organizationName: organizationName as string | null,
    isAdmin,
    user: session?.user,
  }
}
