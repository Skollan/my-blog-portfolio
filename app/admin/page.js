"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

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
        <div className="bg-gray-50 p-4 rounded mb-8">
          <p>
            Connecté: <strong>{user.email}</strong>
          </p>
        </div>
      )}

      <div className="grid gap-4">
        <Link
          href="/admin/posts"
          className="p-6 border rounded-lg hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">Articles</h2>
          <p className="text-gray-600">Gérer les articles du blog</p>
        </Link>

        <Link
          href="/admin/projects"
          className="p-6 border rounded-lg hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">Projets</h2>
          <p className="text-gray-600">Gérer le portfolio</p>
        </Link>
        <Link
          href="/admin/messages"
          className="p-6 border rounded-lg hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">Messages</h2>
          <p className="text-gray-600">Voir les messages de contact</p>
        </Link>
      </div>
    </div>
  );
}
