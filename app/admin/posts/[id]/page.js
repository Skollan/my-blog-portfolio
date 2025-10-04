"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter, useParams } from "next/navigation"
import ImageUpload from "@/components/admin/ImageUpload"
import { parseMarkdown } from "@/lib/markdown"

export default function EditArticle() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
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

  useEffect(() => {
    fetchPost()
  }, [])

  const fetchPost = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("id", params.id)
      .single()

    if (data) {
      setFormData({
        ...data,
        tags: data.tags?.join(", ") || ""
      })
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    const tagsArray = formData.tags ? formData.tags.split(",").map(t => t.trim()) : []

    const { error } = await supabase
      .from("posts")
      .update({
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        cover_image: formData.cover_image,
        tags: tagsArray,
        published: formData.published,
        featured: formData.featured,
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)

    if (error) {
      alert("Erreur: " + error.message)
      setSaving(false)
    } else {
      router.push("/admin/posts")
    }
  }

  if (loading) return <p>Chargement...</p>

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Éditer article</h1>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          {showPreview ? "Masquer" : "Prévisualiser"}
        </button>
      </div>

      <div className={`grid gap-8 ${showPreview ? "grid-cols-2" : "grid-cols-1"}`}>
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
            <label className="block text-sm font-medium mb-2">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({...formData, slug: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
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
            <label className="block text-sm font-medium mb-2">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
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
              <span className="text-sm">Featured</span>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
            >
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </button>
            
            <button
              type="button"
              onClick={() => router.push("/admin/posts")}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </form>

        {showPreview && (
          <div className="border rounded-lg p-6 bg-gray-50">
            <h2 className="text-2xl font-bold mb-4">{formData.title}</h2>
            <p className="text-gray-600 mb-4">{formData.excerpt}</p>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(formData.content) }}
            />
          </div>
        )}
      </div>
    </div>
  )
}