"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Erro de Configuração",
    description:
      "Houve um problema com a configuração do sistema. Verifique se o Spoke está registrado corretamente no Hub ou entre em contato com o suporte.",
  },
  AccessDenied: {
    title: "Acesso Negado",
    description:
      "Você não tem permissão para acessar este sistema. Entre em contato com o administrador da sua organização.",
  },
  Verification: {
    title: "Erro de Verificação",
    description:
      "Não foi possível verificar sua identidade. Tente fazer login novamente.",
  },
  Default: {
    title: "Erro de Autenticação",
    description:
      "Ocorreu um erro durante o processo de autenticação. Por favor, tente novamente.",
  },
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error") || "Default"

  const errorInfo = errorMessages[error] || errorMessages.Default

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {errorInfo.title}
            </h1>
            <p className="text-gray-600">{errorInfo.description}</p>
          </div>

          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="block w-full text-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Tentar Novamente
            </Link>
            <Link
              href="/"
              className="block w-full text-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Voltar para Início
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Precisa de ajuda?{" "}
          <a href="#" className="text-primary hover:underline">
            Entre em contato com o suporte
          </a>
        </p>
      </div>
    </div>
  )
}
