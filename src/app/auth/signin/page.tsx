"use client"

import { signIn } from "next-auth/react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/admin"

  const handleSignIn = async (forceLogin = false) => {
    if (isLoading) return
    setIsLoading(true)

    // Se forceLogin for true, passamos prompt: "login" para o Hub
    const options: any = { callbackUrl }
    if (forceLogin) {
      options.prompt = "login"
    }

    await signIn("hub", options)
  }

  // Auto-login on load
  useEffect(() => {
    handleSignIn()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-xl font-medium mb-2">Autenticando...</h1>
        <p className="text-slate-500 text-sm">Validando sua sessão com o FormBuilder Hub.</p>
        <div className="mt-4 animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  )
}
