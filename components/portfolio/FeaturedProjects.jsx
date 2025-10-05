"use client"

import { useState } from "react"
import ProjectCard from "./ProjectCard"
import ProjectModal from "./ProjectModal"

export default function FeaturedProjects({ projects }) {
  const [selectedProject, setSelectedProject] = useState(null)

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onClick={setSelectedProject}
          />
        ))}
      </div>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  )
}