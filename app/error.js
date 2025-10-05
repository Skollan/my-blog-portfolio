"use client"

export default function Error({ error, reset }) {
  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold mb-4">Une erreur est survenue</h2>
      <p className="text-gray-600 mb-6">{error.message}</p>
      <button
        onClick={reset}
        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 dark:bg-white dark:text-black"
      >
        Réessayer
      </button>
    </div>
  )
}