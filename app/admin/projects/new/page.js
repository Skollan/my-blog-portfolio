"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import ImageUpload from "@/components/admin/ImageUpload"

export default function NewProject() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    long_description: "",
    tech_stack: "",
    github_url: "",
    live_url: "",
    image_url: "",
    featured: false,
    order_index: 0
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

    const techArray = formData.tech_stack ? formData.tech_stack.split(",").map(t => t.trim()) : []

    const { error } = await supabase
      .from("projects")
      .insert([{
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        description: formData.description,
        long_description: formData.long_description,
        tech_stack: techArray,
        github_url: formData.github_url,
        live_url: formData.live_url,
        image_url: formData.image_url,
        featured: formData.featured,
        order_index: parseInt(formData.order_index) || 0
      }])

    if (error) {
      alert("Erreur: " + error.message)
      setLoading(false)
    } else {
      router.push("/admin/projects")
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Nouveau projet</h1>

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
          onUploadComplete={(url) => setFormData({...formData, image_url: url})}
          currentImage={formData.image_url}
        />

        <div>
          <label className="block text-sm font-medium mb-2">Description courte</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            rows="2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description détaillée</label>
          <textarea
            value={formData.long_description}
            onChange={(e) => setFormData({...formData, long_description: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            rows="5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Technologies (séparées par virgules)</label>
          <input
            type="text"
            value={formData.tech_stack}
            onChange={(e) => setFormData({...formData, tech_stack: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="React, Next.js, Tailwind"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">GitHub URL</label>
            <input
              type="url"
              value={formData.github_url}
              onChange={(e) => setFormData({...formData, github_url: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Live URL</label>
            <input
              type="url"
              value={formData.live_url}
              onChange={(e) => setFormData({...formData, live_url: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Ordre affichage</label>
            <input
              type="number"
              value={formData.order_index}
              onChange={(e) => setFormData({...formData, order_index: e.target.value})}
              className="w-20 px-3 py-2 border rounded-lg"
            />
          </div>

          <label className="flex items-center gap-2 mt-7">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({...formData, featured: e.target.checked})}
            />
            <span className="text-sm">Projet featured</span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
          >
            {loading ? "Création..." : "Créer le projet"}
          </button>
          
          <button
            type="button"
            onClick={() => router.push("/admin/projects")}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}