import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Redirect logged in users away from login page
    if (path === "/login" && token) {
      if (token.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url))
      } else if (token.role === "COMMITTEE") {
        return NextResponse.redirect(new URL("/committee/quick-count", req.url))
      } else {
        return NextResponse.redirect(new URL("/user/dashboard", req.url))
      }
    }

    // Protect admin routes
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Protect committee routes
    if (path.startsWith("/committee") && !["ADMIN", "COMMITTEE"].includes(token?.role as string)) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Protect user routes
    if (path.startsWith("/user") && !token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Allow access to login page
        if (path === "/login") {
          return true
        }

        // Require authentication for protected routes
        if (path.startsWith("/admin") || path.startsWith("/user") || path.startsWith("/committee")) {
          return !!token
        }

        return true
      },
    },
  },
)

export const config = {
  matcher: ["/login", "/admin/:path*", "/user/:path*", "/committee/:path*"],
}
