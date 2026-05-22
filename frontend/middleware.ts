import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Phân quyền chi tiết dựa trên Path
    if (path.startsWith("/management/staff") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/management") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Chỉ cho phép nếu đã có Token
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  // Các đường dẫn cần bảo vệ (loại trừ login và các file tĩnh)
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
