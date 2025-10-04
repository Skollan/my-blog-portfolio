// app/admin/posts/[id]/page.js
import EditPostForm from './EditPostForm';
import { createServerClient } from '@supabase/ssr'
import { cookies } from "next/headers";

export default async function EditPostPage({ params }) {
  const { id } = await params;

  // Créer le client Supabase côté serveur
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  // Vérifier l'authentification
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return <p className="p-6 text-red-500">Vous devez être connecté pour éditer un article.</p>;
  }

  // fetch serveur
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !post) {
    return <p className="p-6 text-red-500">Erreur chargement article</p>;
  }

  // On envoie les données au client component
  return <EditPostForm post={post} />;
}
