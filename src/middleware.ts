
import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [

    "/((?!api/|_next/|_static/|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  let hostname = req.headers.get("host");

  hostname = hostname?.split(':')[0];

  if (!hostname) {
      return NextResponse.next();
  }

  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

  return NextResponse.rewrite(new URL(`/domain/${hostname}${path}`, req.url));
}

