import Image from "next/image"
import Link from "next/link"
import React from "react"
import { Project } from "@/lib/supabase"

interface ProjectCardProps {
  project: Project
  onClick: (project: Project) => void
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <div 
      onClick={() => onClick(project)}
      className="border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
    >
      {project.image_url && (
        <div className="relative w-full h-48">
          <Image
            src={project.image_url}
            alt={project.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      
      <div className="p-5">
        <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
        <p className="text-gray-600 mb-4">{project.description}</p>
        
        {project.tech_stack && (
          <div className="flex flex-wrap gap-2">
            {project.tech_stack.map((tech) => (
              <span
                key={tech}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}