"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function PostsList() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
    
    setPosts(data || [])
    setLoading(false)
  }

  const deletePost = async (id) => {
    if (!confirm("Supprimer cet article ?")) return

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id)

    if (!error) {
      fetchPosts()
    }
  }

  if (loading) return <p>Chargement...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Articles</h1>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Nouvel article
        </Link>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{post.title}</h3>
              <p className="text-sm text-gray-500">
                {new Date(post.created_at).toLocaleDateString("fr-FR")} • 
                {post.published ? " Publié" : " Brouillon"}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Link
                href={`/admin/posts/${post.id}`}
                className="px-3 py-1 border rounded hover:bg-gray-50"
              >
                Éditer
              </Link>
              <button
                onClick={() => deletePost(post.id)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}