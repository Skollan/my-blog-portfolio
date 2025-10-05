import { supabase } from "@/lib/supabase"
import PostCard from "@/components/blog/PostCard"
import FeaturedProjects from "@/components/portfolio/FeaturedProjects"
import Link from "next/link"

export const revalidate = 60

export default async function Home() {
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(3)

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("featured", true)
    .order("order_index", { ascending: true })
    .limit(3)

  return (
    <div className="space-y-16">
      <section className="text-center py-12 md:py-20">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Bienvenue sur mon blog
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 px-4">
          Développeur web passionné par les nouvelles technologies
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/blog"
            className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Voir le blog
          </Link>
          <Link 
            href="/portfolio"
            className="inline-block px-6 py-3 border rounded-lg hover:bg-gray-50 transition"
          >
            Voir mes projets
          </Link>
        </div>
      </section>

      {projects && projects.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Projets mis en avant</h2>
            <Link href="/portfolio" className="text-gray-600 hover:text-black">
              Voir tout →
            </Link>
          </div>
          
          <FeaturedProjects projects={projects} />
        </section>
      )}

      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Articles récents</h2>
          <Link href="/blog" className="text-gray-600 hover:text-black">
            Voir tout →
          </Link>
        </div>
        
        <div className="space-y-6">
          {posts?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  )
}