"use client"

import { useState } from "react"
import { z } from "zod"

const contactSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    subject: z.string().optional(),
    message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
})

export default function ContactForm() {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [errors, setErrors] = useState({})
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    })

    // Fonction pour valider un champ spécifique en temps réel
    const validateField = (fieldName, value) => {
        try {
            // Créer un objet temporaire avec la nouvelle valeur
            const tempData = { ...formData, [fieldName]: value }
            
            // Valider seulement le champ spécifique
            if (fieldName === 'name') {
                contactSchema.shape.name.parse(value)
            } else if (fieldName === 'email') {
                contactSchema.shape.email.parse(value)
            } else if (fieldName === 'message') {
                contactSchema.shape.message.parse(value)
            }
            
            // Si la validation passe, supprimer l'erreur pour ce champ
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[fieldName]
                return newErrors
            })
        } catch (error) {
            // Si la validation échoue, ajouter l'erreur
            if (error.issues && error.issues[0]) {
                setErrors(prev => ({
                    ...prev,
                    [fieldName]: error.issues[0].message
                }))
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})

        // Validation côté client
        const result = contactSchema.safeParse(formData)

        if (!result.success) {
            const fieldErrors = {}
            if (result.error?.issues) {
                result.error.issues.forEach(err => {
                    fieldErrors[err.path[0]] = err.message
                })
            }
            setErrors(fieldErrors)
            setLoading(false)
            return
        }

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (!res.ok) {
                const errorData = await res.json()
                console.error("Erreur API:", errorData)
                setErrors({ general: `Erreur lors de l'envoi: ${errorData.error || 'Erreur inconnue'}` })
                setLoading(false)
                return
            }

            setSuccess(true)
            setFormData({ name: "", email: "", subject: "", message: "" })
        } catch (err) {
            console.error("Erreur fetch:", err)
            setErrors({ general: "Erreur lors de l'envoi du message" })
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                    Message envoyé !
                </h3>
                <p className="text-green-700 dark:text-green-300">
                    Je vous répondrai dans les plus brefs délais.
                </p>
                <button
                    onClick={() => setSuccess(false)}
                    className="mt-4 text-sm text-green-600 dark:text-green-400 hover:underline"
                >
                    Envoyer un autre message
                </button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3 rounded">
                    {errors.general}
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Nom *</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                            const value = e.target.value
                            setFormData({ ...formData, name: value })
                            validateField('name', value)
                        }}
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 ${errors.name ? "border-red-500" : "dark:border-gray-700"
                            }`}
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1" style={{color: 'red', fontSize: '14px'}}>{errors.name}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                            const value = e.target.value
                            setFormData({ ...formData, email: value })
                            validateField('email', value)
                        }}
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 ${errors.email ? "border-red-500" : "dark:border-gray-700"
                            }`}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1" style={{color: 'red', fontSize: '14px'}}>{errors.email}</p>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Sujet</label>
                <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Message *</label>
                <textarea
                    value={formData.message}
                    onChange={(e) => {
                        const value = e.target.value
                        setFormData({ ...formData, message: value })
                        validateField('message', value)
                    }}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 ${errors.message ? "border-red-500" : "dark:border-gray-700"
                        }`}
                    rows="6"
                />
                {errors.message && (
                    <p className="text-red-500 text-sm mt-1" style={{color: 'red', fontSize: '14px'}}>{errors.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 disabled:bg-gray-400 transition"
            >
                {loading ? "Envoi..." : "Envoyer"}
            </button>
        </form>
    )
}