import { auth } from "@/auth"
import { NextResponse } from "next/server"

/**
 * Tenant Resolution Logic (Edge Runtime Compatible)
 */
async function resolveTenant(hostname: string): Promise<string | null> {
  if (!hostname) return null;
  const domain = hostname.split(':')[0].toLowerCase();

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'govteam.com.br';
  const dedicatedDomains = [process.env.NEXT_PUBLIC_CARTA_DOMAIN || 'cartadeservicos.com.br'];

  // 1. Dedicated domains
  for (const dedicated of dedicatedDomains) {
    if (domain.endsWith(`.${dedicated}`)) {
      return domain.replace(`.${dedicated}`, '');
    }
  }

  // 2. Base domain
  if (domain.endsWith(`.${baseDomain}`)) {
    const slug = domain.replace(`.${baseDomain}`, '');
    const reserved = ['app', 'www', 'admin', 'sys', 'api', 'dev', 'traefik'];
    if (reserved.includes(slug)) return null;
    return slug;
  }

  // 3. Vanity Domains (via Hub API proxy)
  try {
    const hubUrl = process.env.NEXT_PUBLIC_HUB_URL || 'http://localhost:3000';
    const res = await fetch(`${hubUrl}/api/public/tenant/resolve?domain=${encodeURIComponent(domain)}`, {
      next: { revalidate: 3600 }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.tenantSlug) return data.tenantSlug;
    }
  } catch (error) {
    console.error(`[resolveTenant] Falha resolver vanity ${domain} via Hub:`, error);
  }

  return null;
}

// Rotas que não requerem autenticação
const PUBLIC_ROUTES = [
  /^\/r\/.+/,                      // Tracking de links
  /^\/vote\/.+/,                   // Landing page de votação
  /^\/opt-out\/.+/,                // Opt-out de leads
  /^\/api\/public\/.+/,            // APIs públicas
  /^\/api\/auth\/.+/,              // NextAuth callbacks
  /^\/api\/hub\/.+/,               // Integração com Hub
  /^\/api\/tracking\/.+\/validate/, // Validação de links de votação
  /^\/api\/submissions.*/,         // Submissão de votos
  /^\/api\/leads\/partial/,        // Identificação de eleitores
  /^\/api\/otp\/.+/,               // Verificação de WhatsApp (OTP)
  /^\/api\/sys\/provision/,        // Provisionamento via Hub
  /^\/api\/estabelecimentos.*/,    // Spoke-to-spoke integration (auth handled in route)
  /^\/api\/proxy.*/,               // Proxy para formulários públicos (fetch seguro)
  /^\/auth\/.+/,                   // Páginas de autenticação
  /^\/$/,                          // Home
]

export default auth(async (req) => {
  const { pathname } = req.nextUrl
  const hostname = req.headers.get("host") || ""

  // 1. Extrair informações de Tenant
  const tenantSlug = req.headers.get("x-tenant-slug") || await resolveTenant(hostname)

  // 2. Injetar contexto básico nos headers
  const requestHeaders = new Headers(req.headers)
  if (tenantSlug) requestHeaders.set("x-tenant-slug", tenantSlug)

  console.log(`[MIDDLEWARE] Path: ${pathname} | Tenant: ${tenantSlug}`);

  // Permitir rotas públicas
  const isPublicRoute = PUBLIC_ROUTES.some((pattern) => pattern.test(pathname));

  if (isPublicRoute) {
    return NextResponse.next({
      request: { headers: requestHeaders }
    })
  }

  // Verificar autenticação usando req.auth (NextAuth v5)
  const session = req.auth

  if (!session?.user) {
    // Para APIs, retornar 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    // Para páginas, redirecionar para a página de login customizada
    const signInUrl = new URL("/auth/signin", req.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Verificar organizationId (exceto super admins)
  const user = session.user as any

  if (!user.organizationId && !user.isPlatformAdmin) {
    console.log(`[MIDDLEWARE] BLOCKED: No organizationId and not platform admin`);
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Configuração inválida - organizationId não encontrado" },
        { status: 403 }
      )
    }

    const errorUrl = new URL("/auth/error", req.url)
    errorUrl.searchParams.set("error", "Configuration")
    return NextResponse.redirect(errorUrl)
  }

  // Injetar headers de autenticação adicionais
  requestHeaders.set("x-organization-id", user.organizationId)
  requestHeaders.set("x-user-id", user.id || user.sub)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
})


export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
