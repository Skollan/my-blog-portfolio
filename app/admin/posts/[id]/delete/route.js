// app/admin/posts/[id]/delete/route.js
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  const { id } = await params;

  // Créer le client Supabase côté serveur avec gestion des cookies
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  // Vérifier l'authentification
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Authentication error:", authError);
    return NextResponse.json(
      {
        error: "Non autorisé. Vous devez être connecté pour supprimer un post.",
      },
      { status: 401 }
    );
  }

  console.log("Authenticated user attempting to delete post:", {
    userId: user.id,
    postId: id,
  });

  // Supprimer le post (RLS policy s'applique automatiquement)
  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("Post deleted successfully:", id);

  // Redirection vers /admin/posts
  return NextResponse.redirect(new URL("/admin/posts", request.url));
}
