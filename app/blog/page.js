import { supabase } from "@/lib/supabase";
import PostCard from "@/components/blog/PostCard";
import SearchBar from "@/components/blog/SearchBar";
import Link from "next/link";

export const revalidate = 60;

export default async function BlogPage({ searchParams }) {
  // On récupère la page via la URL
  const params = await searchParams;
  const page = Number(params?.page) || 1; // ✅ Enlève le await ici
  const search = params?.search || "";
  const tag = params?.tag || "";
  const pageSize = 5;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("posts")
    .select("*", { count: "exact" })
    .eq("published", true);

  // Recherche par titre ou contenu
  if (search) {
    query = query.or(
      `title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`
    );
  }

  if (tag) {
    query = query.contains("tags", [tag]);
  }

  const {
    data: posts,
    error,
    count,
  } = await query.order("created_at", { ascending: false }).range(from, to);

  if (error) {
    console.error("Erreur Supabase :", error);
    return <p>Erreur de chargement 😕</p>;
  }

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>

      <SearchBar />

      {search && (
        <div className="mb-4 text-gray-600 dark:text-gray-400">
          {count} résultat{count > 1 ? "s" : ""} pour &quot;{search}&quot;
          <Link href="/blog" className="ml-2 text-sm underline">
            Effacer
          </Link>
        </div>
      )}

      {tag && (
        <div className="mb-4 text-gray-600 dark:text-gray-400">
          Articles avec le tag &quot;{tag}&quot;
          <Link href="/blog" className="ml-2 text-sm underline">
            Effacer
          </Link>
        </div>
      )}

      <ul className="space-y-6 mb-8">
        {posts?.map((post) => (
          <li key={post.id}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="flex justify-center gap-4">
          {page > 1 && (
            <Link
              href={`/blog?page=${page - 1}`}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              ← Précédent
            </Link>
          )}
          {page < totalPages && (
            <Link
              href={`/blog?page=${page + 1}`}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              Suivant →
            </Link>
          )}
        </div>
      )}

      {posts?.length === 0 && (
        <p className="text-gray-500">Aucun article trouvé.</p>
      )}
    </main>
  );
}
