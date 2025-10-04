"use client"

import { useState } from "react"
import ImageUpload from "@/components/admin/ImageUpload"

export default function TestUpload() {
  const [imageUrl, setImageUrl] = useState("")

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Test Upload Image</h1>
      
      <ImageUpload onUploadComplete={(url) => setImageUrl(url)} />
      
      {imageUrl && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p className="text-sm font-medium mb-2">URL générée:</p>
          <code className="text-xs break-all">{imageUrl}</code>
        </div>
      )}
    </div>
  )
}