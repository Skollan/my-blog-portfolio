import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { supabase } from "@/lib/supabase"
import { z } from "zod"

const resend = new Resend(process.env.RESEND_API_KEY)

const contactSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  subject: z.string().optional(),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = contactSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.issues },
        { status: 400 }
      )
    }

    const { name, email, subject, message } = result.data

    const { error: dbError } = await supabase
      .from("messages")
      .insert([{ name, email, subject, message }])

    if (dbError) throw dbError

    if (process.env.NODE_ENV === 'production') {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: "ton-email@gmail.com",
        subject: subject || "Nouveau message de contact",
        html: `
          <h2>Nouveau message de ${name}</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Sujet:</strong> ${subject || "Aucun"}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de l'envoi" },
      { status: 500 }
    )
  }
}