import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { SessionProvider } from "@/components/providers/session-provider"
import { getServerAuthSession } from "@/lib/auth-helpers"

import { QueryProvider } from "@/components/providers/query-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Participa - Gestão de Enquetes e Votações",
  description: "Plataforma para gestão de enquetes, votações e reconhecimento.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerAuthSession()

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              {children}
            </QueryProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
