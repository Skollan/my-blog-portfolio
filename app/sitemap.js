import { supabase } from "@/lib/supabase"

export default async function sitemap() {
  const { data: posts } = await supabase
    .from("posts")
    .select("slug, updated_at")
    .eq("published", true)

  const { data: projects } = await supabase
    .from("projects")
    .select("slug")

  const postEntries = posts?.map((post) => ({
    url: `https://my-blog-portfolio-zeta.vercel.app/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  })) || []

  const projectEntries = projects?.map((project) => ({
    url: `https://my-blog-portfolio-zeta.vercel.app/portfolio/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  })) || []

  return [
    {
      url: 'https://my-blog-portfolio-zeta.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://my-blog-portfolio-zeta.vercel.app/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://my-blog-portfolio-zeta.vercel.app/portfolio',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://my-blog-portfolio-zeta.vercel.app/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...postEntries,
    ...projectEntries,
  ]
}