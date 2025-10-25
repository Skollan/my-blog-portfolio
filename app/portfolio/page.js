"use client"

import { useEffect, useState } from "react"
import dynamic from 'next/dynamic'
import { supabase } from "@/lib/supabase"

// import avec dynamic pour les imports lourds et favoriser le lazyloading

const ProjectCard = dynamic(() => import('@/components/portfolio/ProjectCard'), {
  loading: () => <div>Chargement...</div>,
})

const ProjectModal = dynamic(() => import('@/components/portfolio/ProjectModal'), {
  loading: () => <div>Chargement...</div>,
})

export default function Portfolio() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTech, setSelectedTech] = useState("all")
  const [allTechs, setAllTechs] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("order_index", { ascending: true })

    if (data) {
      setProjects(data)
      
      const techs = new Set()
      data.forEach(project => {
        project.tech_stack?.forEach(tech => techs.add(tech))
      })
      setAllTechs(["all", ...Array.from(techs)])
    }
    setLoading(false)
  }

  const filteredProjects = selectedTech === "all"
    ? projects
    : projects.filter(p => p.tech_stack?.includes(selectedTech))

  if (loading) return <p>Chargement...</p>

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Portfolio</h1>
        <p className="text-gray-600">Mes projets et réalisations</p>
      </div>

      {allTechs.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {allTechs.map(tech => (
            <button
              key={tech}
              onClick={() => setSelectedTech(tech)}
              className={`px-4 py-2 rounded-lg transition ${
                selectedTech === tech
                  ? "bg-black text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {tech === "all" ? "Tous" : tech}
            </button>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project}
            onClick={setSelectedProject}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <p className="text-gray-500 text-center py-12">
          Aucun projet trouvé
        </p>
      )}

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  )
}