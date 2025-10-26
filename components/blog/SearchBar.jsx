"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/blog?search=${encodeURIComponent(query)}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="mb-8">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un article..."
          className="flex-1 px-4 py-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200"
        >
          Rechercher
        </button>
      </div>
    </form>
  )
}