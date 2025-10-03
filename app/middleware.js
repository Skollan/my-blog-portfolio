import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ⚠️ Ne pas utiliser supabase depuis lib/ ici → middleware tourne Edge, sans cookies par défaut
export async function middleware(req) {
  const res = NextResponse.next();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: { headers: { Authorization: req.headers.get("Authorization") } }
    }
  );

  // Récupère la session via cookies
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à /admin, on redirige vers /admin/login
  if (pathname.startsWith("/admin") && !session) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

// 👇 Indique à Next quelles routes sont concernées
export const config = {
  matcher: ["/admin/:path*"]
};
