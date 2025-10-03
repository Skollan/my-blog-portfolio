import { supabase } from "@/lib/supabase";
import PostCard from "@/components/blog/PostCard"
import Link from "next/link"

export const revalidate = 60

export default async function HomePage() {
  // récupérer les 3 derniers articles publiés
  const { data: posts } = await supabase
      .from("posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(3)

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12 md:p-y-20">
        <h1 className="text-3xl font-bold mb-4 md:text-5xl">
          Bienvenue sur mon blog
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 px-4">
          Développeur web passionné par les nouvelles technologies
        </p>
        <Link 
          href="/blog"
          className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          Voir tous les articles
        </Link>
      </section>

      {/* Articles récents */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Articles récents</h2>
          <Link href="/blog" className="text-gray-600 hover:text-black">
            Voir tout →
          </Link>
        </div>
        
        <ul className="space-y-6">
          {posts?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ul>
      </section>
    </div>
  );
}
