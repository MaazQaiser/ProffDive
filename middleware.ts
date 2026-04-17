import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Set `NEXT_PUBLIC_SUPERADMIN_ENABLED=false` to disable `/superadmin` (default: enabled). */
export function middleware(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_SUPERADMIN_ENABLED === "false") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/superadmin/:path*"],
};
