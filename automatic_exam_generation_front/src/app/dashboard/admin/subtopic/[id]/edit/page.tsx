"use client"
import { useState, useEffect } from "react"
import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldGroup, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { getSubtopicById , postSubtopic } from "@/services/subtopicService"

interface Subtopic {
  id: string
  nombre: string
}

export default function SubtopicEdit({ params }: { params: { id: string } }) {
  const [subtopic, setSubtopic] = useState<Subtopic | null>(null)
  const [nombre, setNombre] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchSubtopic = async () => {
      try {
        const data = await getSubtopicById(params.id);
        setSubtopic(data);
        setNombre(data.nombre);
      } catch (error) {
        console.error("Error fetching subtopic:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubtopic();
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!nombre.trim()) return

    setIsSaving(true)
    try {
      await postSubtopic({ name: nombre });
    } catch (error) {
      console.error("Error creating subtopic:", error);
    } finally {
      setIsSaving(false);
    }

    router.push(`/dashboard/admin/subtopic/${params.id}`)
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">Cargando...</div>
      </main>
    )
  }

  if (!subtopic) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center text-destructive">Subtema no encontrado</div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold">Editar Subtema</h1>
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
                    placeholder="Nombre del subtema"
                    required
                  />
                </Field>
              </FieldSet>
            </FieldGroup>

            <div className="flex gap-3">
              <Link href={`/dashboard/admin/subtopic/${subtopic.id}`}>
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
