import { updateSession } from "./utils/supabase/middleware";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if this is an admin route that needs authentication
  const isAdminRoute = pathname.startsWith("/admin");

  // If it's an admin route, call updateSession for authentication checking
  if (isAdminRoute) {
    return await updateSession(request);
  }

  // For non-admin routes, allow access without authentication checks
  return;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, icons, etc.)
     * - file extensions for static assets
     */
    "/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)",
  ],
};
