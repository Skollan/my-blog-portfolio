import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { z } from "zod"

const emailSchema = z.string().email()

export async function POST(request) {
  try {
    const { email } = await request.json()

    const result = emailSchema.safeParse(email)
    if (!result.success) {
      return NextResponse.json(
        { error: "Email invalide" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("newsletter")
      .insert([{ email }])

    if (error) {
      if (error.code === "23505") { // Duplicate
        return NextResponse.json(
          { error: "Cet email est déjà inscrit" },
          { status: 400 }
        )
      }
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    )
  }
}