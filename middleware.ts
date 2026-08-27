import { auth } from "@/auth";

export default auth;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|health$|health/|.*\\.(?:ico|png|svg|webp)$).*)",
  ],
};
