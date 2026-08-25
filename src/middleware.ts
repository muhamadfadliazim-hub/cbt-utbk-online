import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;
    
    const role = token?.role as string;
    const isApproved = token?.isApproved as boolean;
    
    // Redirect logic based on roles and approval status
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/student", req.url));
    }
    
    if (pathname.startsWith("/student")) {
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      
      // If student is not approved, send to pending page
      if (role === "STUDENT" && !isApproved) {
        return NextResponse.redirect(new URL("/pending", req.url));
      }
    }
    
    // Prevent approved students or admins from staying on pending page
    if (pathname === "/pending") {
      if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
      if (role === "STUDENT" && isApproved) return NextResponse.redirect(new URL("/student", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;
        
        if (pathname.startsWith("/student") || pathname.startsWith("/admin") || pathname.startsWith("/parent") || pathname.startsWith("/pending")) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|register).*)'],
};
