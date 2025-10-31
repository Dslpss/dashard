import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware: protege rotas do app exigindo cookie `token`.
// Exceções: /login, /api/auth/*, _next, static assets, favicon.

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow next internals and auth endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/login"
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    // opcional: anexar a rota de origem para redirecionar após login
    loginUrl.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Caso haja cookie, permitimos o acesso. NOTE: middleware só verifica presença
  // do cookie. A validação do token (assinatura/expiração) deve ser feita nas
  // rotas de API server-side usando `lib/auth.verifyToken` para segurança completa.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login|api/auth).*)"],
};
