"use client"

import { useEffect } from "react"
import Image from "next/image"

export default function ProjectModal({ project, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [onClose])

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header fixe */}
        <div className="bg-white border-b px-6 py-4 flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-bold">{project.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content scrollable */}
        <div className="p-6 overflow-y-auto">
          {project.image_url && (
            <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
              <Image
                src={project.image_url}
                alt={project.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {project.tech_stack && (
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tech_stack.map(tech => (
                <span
                  key={tech}
                  className="text-sm bg-gray-100 px-3 py-1 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">
              {project.long_description || project.description}
            </p>
          </div>

          <div className="flex gap-4">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                GitHub
              </a>
            )}
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                Live Demo
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}