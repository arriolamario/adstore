import { NextResponse } from "next/server";
import { auth } from "./auth";

export default auth((request) => {
  if (request.nextUrl.pathname.startsWith("/admin") && request.auth?.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (request.nextUrl.pathname.startsWith("/mis-reservas") && !request.auth?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (request.nextUrl.pathname.startsWith("/perfil") && !request.auth?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/mis-reservas", "/perfil"],
};
