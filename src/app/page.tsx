import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Participa</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Sistema de Enquetes, Votações e Pesquisas Online
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/admin"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Acessar Painel
          </Link>
        </div>
      </div>
    </main>
  )
}

