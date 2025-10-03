import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default async function HomePage() {
  const {data : posts, error} = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', {ascending: false})

  if (error){
    console.error('Supabase error:', error)
  }

  return (
    <div className="space-y-8">
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold mb-4">
          Bienvenue sur mon blog
        </h1>
        <p className="text-xl text-gray-600">
          Développeur web passionné par les nouvelles technologies
        </p>
      </section>

      <section className="p-4">
        <h1 className="text-2xl font-bold mb-4">Articles de test</h1>
      <ul>
        {posts?.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
      </section>
    </div>
  );
}
