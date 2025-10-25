import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import Image from "next/image";

export const revalidate = 60; //ISR

export async function generateMetadata({ params }) {
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      images: post.cover_image ? [post.cover_image] : [],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post || error) {
    console.error("Erreur chargement de article : ", error);
    notFound();
  }

  const date = new Date(post.created_at).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // après le contenu Markdown
  const { data: adjacent } = await supabase
    .from("posts")
    .select("slug, title, created_at")
    .eq("published", true)
    .order("created_at", { ascending: true });

  const index = adjacent.findIndex((p) => p.slug === slug);
  const prev = adjacent[index - 1];
  const next = adjacent[index + 1];

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 prose prose-gray dark:prose-invert">
      {post.cover_image && (
        <Image
          src={post.cover_image}
          alt={post.title}
          className="w-full rounded-xl mb-6 object-cover max-h-96"
        />
      )}

      <p className="text-sm text-gray-500">{date}</p>
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

      {post.tags?.lenght > 0 && (
        <ul className="flex flex-wrap gap-2 mb-6">
          {post.tags.map((tag) => (
            <li
              key={tag}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
            >
              <p>#{tag}</p>
            </li>
          ))}
        </ul>
      )}
      <Markdown>{post.content}</Markdown>
      <div className="flex justify-between mt-10">
        {prev ? (
          <a
            href={`/blog/${prev.slug}`}
            className="text-blue-600 hover:underline"
          >
            ← {prev.title}
          </a>
        ) : (
          <span />
        )}

        {next ? (
          <a
            href={`/blog/${next.slug}`}
            className="text-blue-600 hover:underline"
          >
            {next.title} →
          </a>
        ) : (
          <span />
        )}
      </div>
    </article>
  );
}
