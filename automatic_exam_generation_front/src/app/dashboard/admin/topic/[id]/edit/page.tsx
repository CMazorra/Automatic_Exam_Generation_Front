"use client"
import React, { useEffect, useState, use } from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldGroup, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { getTopicById, updateTopic } from "@/services/topicService"

interface Topic {
  id: string
  nombre?: string
  name?: string
}

export default function TopicEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [nombre, setNombre] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const data = await getTopicById(id)
        setTopic(data)
        setNombre((data?.nombre || data?.name || "").toString())
      } catch (error) {
        console.error("Error fetching topic:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTopic()
  }, [id])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!nombre.trim()) return

    setIsSaving(true)
    try {
      await updateTopic(id, { name: nombre.trim() })
      router.push(`/dashboard/admin/topic`)
    } catch (error) {
      console.error("Error updating topic:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">Cargando...</div>
      </main>
    )
  }

  if (!topic) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center text-destructive">Tema no encontrado</div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold">Editar Tema</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
              <FieldSet>
                <Field>
                  <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre del tema"
                    required
                  />
                </Field>
              </FieldSet>
            </FieldGroup>

            <div className="flex gap-3">
              <Link href={`/dashboard/admin/topic/${topic.id}`}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={isSaving || !nombre.trim()}>
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
