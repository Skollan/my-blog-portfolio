"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Messages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
    
    setMessages(data || [])
    setLoading(false)
  }

  const toggleRead = async (id, read) => {
    await supabase
      .from("messages")
      .update({ read: !read })
      .eq("id", id)
    
    fetchMessages()
  }

  const deleteMessage = async (id) => {
    if (!confirm("Supprimer ce message ?")) return
    
    await supabase
      .from("messages")
      .delete()
      .eq("id", id)
    
    fetchMessages()
  }

  if (loading) return <p>Chargement...</p>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Messages</h1>

      <div className="space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`border rounded-lg p-4 ${msg.read ? "bg-gray-50 dark:bg-gray-800" : "bg-white dark:bg-gray-900"}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">{msg.name}</h3>
                <p className="text-sm text-gray-500">{msg.email}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleRead(msg.id, msg.read)}
                  className="text-sm px-2 py-1 border rounded"
                >
                  {msg.read ? "Non lu" : "Lu"}
                </button>
                <button
                  onClick={() => deleteMessage(msg.id)}
                  className="text-sm px-2 py-1 bg-red-600 text-white rounded"
                >
                  Supprimer
                </button>
              </div>
            </div>
            {msg.subject && (
              <p className="font-medium mb-2">Sujet: {msg.subject}</p>
            )}
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{msg.message}</p>
            <p className="text-xs text-gray-500 mt-2">
              {new Date(msg.created_at).toLocaleString("fr-FR")}
            </p>
          </div>
        ))}

        {messages.length === 0 && (
          <p className="text-gray-500 text-center py-8">Aucun message</p>
        )}
      </div>
    </div>
  )
}