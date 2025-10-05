"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function ProjectsList() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("order_index", { ascending: true })
    
    setProjects(data || [])
    setLoading(false)
  }

  const deleteProject = async (id) => {
    if (!confirm("Supprimer ce projet ?")) return

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)

    if (!error) {
      fetchProjects()
    }
  }

  if (loading) return <p>Chargement...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projets</h1>
        <Link
          href="/admin/projects/new"
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Nouveau projet
        </Link>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{project.title}</h3>
              <p className="text-sm text-gray-500">
                {project.tech_stack?.join(", ")}
                {project.featured && " • Featured"}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Link
                href={`/admin/projects/${project.id}`}
                className="px-3 py-1 border rounded hover:bg-gray-50"
              >
                Éditer
              </Link>
              <button
                onClick={() => deleteProject(project.id)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <p className="text-gray-500 text-center py-8">Aucun projet</p>
        )}
      </div>
    </div>
  )
}