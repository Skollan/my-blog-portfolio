"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  // Get user info for display purposes only 
  // (authentication is now handled by server-side middleware)
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, [supabase.auth]);

  // logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    // Force a page refresh to ensure the middleware picks up the sign out
    window.location.href = "/admin/login"
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Déconnexion
        </button>
      </div>

      {user && (
        <div className="bg-gray-50 p-4 rounded">
          <p>Connecté en tant que: <strong>{user.email}</strong></p>
        </div>
      )}

      <div className="mt-8">
        <p className="text-gray-600">Interface de gestion des articles arrive bientôt...</p>
      </div>
    </div>
  )

}
