import Link from "next/link"

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page introuvable</p>
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 dark:bg-white dark:text-black"
      >
        Retour à l'accueil
      </Link>
    </div>
  )
}