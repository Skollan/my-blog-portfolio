export default function About() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">À propos</h1>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p className="text-lg">
          Salut ! Je suis un développeur web en apprentissage, passionné par les nouvelles technologies et le développement web moderne.
        </p>
        
        <p>
          Ce blog me permet de documenter mon parcours d'apprentissage, partager mes découvertes et présenter mes projets. J'utilise principalement React, Next.js et Supabase pour créer des applications web.
        </p>

        <div className="pt-8">
          <h2 className="text-2xl font-bold mb-4">Compétences</h2>
          <div className="flex flex-wrap gap-2">
            {["JavaScript", "React", "Next.js", "Tailwind CSS", "Supabase", "Git"].map(skill => (
              <span
                key={skill}
                className="px-4 py-2 bg-gray-100 rounded-lg"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-8">
          <h2 className="text-2xl font-bold mb-4">Contact</h2>
          <p>
            N'hésite pas à me contacter si tu veux discuter de projets, collaborer ou simplement échanger sur le développement web.
          </p>
        </div>
      </div>
    </div>
  )
}