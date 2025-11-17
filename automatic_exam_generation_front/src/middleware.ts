import { NextRequest, NextResponse } from "next/server"

const PUBLIC_PATHS = ["/auth/login"]

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"))
}

function getAllowedBase(role?: string, head?: string) {
  if (!role) return null
  if (role === "ADMIN") return "/dashboard/admin"
  if (role === "TEACHER") return head === "1" ? "/dashboard/head_teacher" : "/dashboard/teacher"
  return "/dashboard/student"
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const role = req.cookies.get("aeg_role")?.value
  const head = req.cookies.get("aeg_head")?.value
  const allowedBase = getAllowedBase(role, head)
  const isAuthenticated = !!allowedBase
  
  if (isPublicPath(pathname)) {
    if (isAuthenticated && pathname.startsWith("/auth/login")) {
      return NextResponse.redirect(new URL(allowedBase!, req.url))
    }
    const res = NextResponse.next()
    res.headers.set("x-mw", "hit")
    return res
  }
  
  if (!isAuthenticated) {
    const nextParam = encodeURIComponent(pathname + search)
    const res = NextResponse.redirect(new URL(`/auth/login?next=${nextParam}`, req.url))
    res.headers.set("x-mw", "hit")
    return res
  }

  if (pathname.startsWith("/dashboard") && !pathname.startsWith(allowedBase!)) {
    const res = NextResponse.redirect(new URL(allowedBase!, req.url))
    res.headers.set("x-mw", "hit")
    return res
  }

  const res = NextResponse.next()
  res.headers.set("x-mw", "hit")
  return res
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|assets|images).*)",
  ],
}