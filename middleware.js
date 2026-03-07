import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Allow access if user is authenticated
    if (req.nextauth.token) {
      return NextResponse.next();
    }
    
    // Redirect to home if not authenticated
    return NextResponse.redirect(new URL("/", req.url));
  },
  {
    callbacks: {
      authorized({ req, token }) {
        // Protect dashboard routes
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return token !== null;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
