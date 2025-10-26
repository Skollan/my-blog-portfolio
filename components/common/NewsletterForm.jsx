"use client"

import { useState } from "react"
import { z } from "zod"

const emailSchema = z.string().email("Email invalide")

export default function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validation
    const result = emailSchema.safeParse(email)
    if (!result.success) {
      setError("Email invalide")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Erreur lors de l'inscription")
        setLoading(false)
        return
      }

      setSuccess(true)
      setEmail("")
    } catch (err) {
      setError("Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-4 rounded-lg text-center">
        Merci pour votre inscription ! 🎉
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre email"
          className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        />
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 disabled:bg-gray-400"
      >
        {loading ? "Inscription..." : "S'inscrire"}
      </button>
    </form>
  )
}