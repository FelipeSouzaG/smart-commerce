
import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     * 5. static files (images, fonts)
     */
    "/((?!api/|_next/|_static/|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. loja1.fluxoclean.com.br)
  let hostname = req.headers.get("host");

  // Remove port if present (dev mode)
  if (hostname) {
    hostname = hostname.split(':')[0];
  }

  // Se não houver hostname ou for localhost sem subdomínio, segue normal
  if (!hostname) {
      return NextResponse.next();
  }

  // Lógica de Reescrita:
  // Mapeia o domínio acessado para a pasta /domain/[domain]/...
  // O backend usará este hostname para identificar o Tenant.
  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

  // Reescreve internamente para a rota dinâmica que carrega a loja
  return NextResponse.rewrite(new URL(`/domain/${hostname}${path}`, req.url));
}
