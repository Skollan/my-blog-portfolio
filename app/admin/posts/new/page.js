"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import ImageUpload from "@/components/admin/ImageUpload"

export default function NewArticle() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    tags: "",
    published: false,
    featured: false
  })

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const tagsArray = formData.tags ? formData.tags.split(",").map(t => t.trim()) : []

    const { error } = await supabase
      .from("posts")
      .insert([{
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        excerpt: formData.excerpt,
        content: formData.content,
        cover_image: formData.cover_image,
        tags: tagsArray,
        published: formData.published,
        featured: formData.featured
      }])

    if (error) {
      alert("Erreur: " + error.message)
      setLoading(false)
    } else {
      router.push("/admin")
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Nouvel article</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Titre</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Slug (laisser vide pour auto)</label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({...formData, slug: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder={generateSlug(formData.title)}
          />
        </div>

        <ImageUpload 
          onUploadComplete={(url) => setFormData({...formData, cover_image: url})}
          currentImage={formData.cover_image}
        />

        <div>
          <label className="block text-sm font-medium mb-2">Extrait</label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            rows="2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Contenu (Markdown)</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
            rows="15"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tags (séparés par virgules)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="react, javascript, tutorial"
          />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({...formData, published: e.target.checked})}
            />
            <span className="text-sm">Publier</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({...formData, featured: e.target.checked})}
            />
            <span className="text-sm">Article featured</span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
          >
            {loading ? "Création..." : "Créer l'article"}
          </button>
          
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}