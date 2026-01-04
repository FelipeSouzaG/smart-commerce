
import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  let hostname = req.headers.get("host");

  // Remove port if present
  hostname = hostname?.split(':')[0];

  // In development, we can test specific tenants using subdomains
  // For example: outlet-barreiro.local.fluxoclean.com.br
  // The backend will receive this hostname and look up the tenant.
  
  // Logic to rewrite the URL to the dynamic route directory
  // e.g. /products -> /domain/outlet-barreiro.local.../products
  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

  return NextResponse.rewrite(new URL(`/domain/${hostname}${path}`, req.url));
}
