"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import Image from "next/image"

export default function ImageUpload({ onUploadComplete, currentImage }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentImage || null)

  const uploadImage = async (e) => {
    try {
      setUploading(true)
      
      const file = e.target.files[0]
      if (!file) return

      // Créer un nom unique
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('post-images')  // ← Changé ici
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Récupérer l'URL publique
      const { data } = supabase.storage
        .from('post-images')  // ← Et ici
        .getPublicUrl(filePath)

      setPreview(data.publicUrl)
      onUploadComplete(data.publicUrl)

    } catch (error) {
      alert('Erreur upload: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Image de couverture</label>
      
      {preview && (
        <div className="relative w-full h-48 mb-4">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover rounded"
          />
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={uploadImage}
        disabled={uploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
      />
      
      {uploading && <p className="text-sm text-gray-500 mt-2">Upload en cours...</p>}
    </div>
  )
}