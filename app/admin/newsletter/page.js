"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Newsletter() {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    const { data } = await supabase
      .from("newsletter")
      .select("*")
      .order("subscribed_at", { ascending: false })
    
    setSubscribers(data || [])
    setLoading(false)
  }

  const deleteSubscriber = async (id) => {
    if (!confirm("Supprimer cet abonné ?")) return
    
    await supabase
      .from("newsletter")
      .delete()
      .eq("id", id)
    
    fetchSubscribers()
  }

  const exportEmails = () => {
    const emails = subscribers.map(s => s.email).join("\n")
    const blob = new Blob([emails], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "newsletter-emails.txt"
    a.click()
  }

  if (loading) return <p>Chargement...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Newsletter ({subscribers.length})</h1>
        <button
          onClick={exportEmails}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Exporter les emails
        </button>
      </div>

      <div className="space-y-2">
        {subscribers.map((sub) => (
          <div key={sub.id} className="flex justify-between items-center border rounded-lg p-4">
            <div>
              <p className="font-medium">{sub.email}</p>
              <p className="text-sm text-gray-500">
                {new Date(sub.subscribed_at).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <button
              onClick={() => deleteSubscriber(sub.id)}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        ))}

        {subscribers.length === 0 && (
          <p className="text-gray-500 text-center py-8">Aucun abonné</p>
        )}
      </div>
    </div>
  )
}