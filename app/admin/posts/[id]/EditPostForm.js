"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import UploadImage from "@/components/admin/ImageUpload";
import Image from "next/image";

export default function EditPostForm({ post }) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [content, setContent] = useState(post.content);
  const [published, setPublished] = useState(post.published);
  const [coverImage, setCoverImage] = useState(post.cover_image || "");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const id = post.id;

    const { data, error } = await supabase
      .from("posts")
      .update({
        title,
        slug,
        content,
        cover_image: coverImage,
        published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) {
      setError(error.message);
    } else {
      router.push("/admin/posts");
      router.refresh();
    }
  }

  return (
    <main className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Modifier l’article</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        aria-labelledby="edit-post-form"
      >
        <h2 id="edit-post-form" className="sr-only">
          Formulaire de modification de l’article
        </h2>

        <div>
          <label htmlFor="title" className="block font-medium mb-1">
            Titre de l’article <span aria-hidden="true">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="border p-2 w-full"
            placeholder="Titre"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block font-medium mb-1">
            Slug <span aria-hidden="true">*</span>
          </label>
          <input
            type="text"
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="border p-2 w-full"
            placeholder="slug-exemple"
          />
        </div>

        <div>
          <label htmlFor="content" className="block font-medium mb-1">
            Contenu <span aria-hidden="true">*</span>
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="border p-2 w-full min-h-[200px]"
            placeholder="Écrivez le contenu ici..."
          />
        </div>

        <fieldset className="flex items-center gap-2">
          <legend className="sr-only">État de publication</legend>
          <input
            type="checkbox"
            id="published"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          <label htmlFor="published">Publier cet article</label>
        </fieldset>

        <div>
        <label className="block font-medium mb-1">Image de couverture</label>
         <UploadImage onUpload={(url) => setCoverImage(url)} />

         <input type="hidden" value={coverImage} name="cover_image" />
       </div>

        {error && (
          <p className="text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Mettre à jour
        </button>
      </form>
    </main>
  );
}
