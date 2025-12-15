"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldGroup, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { postSubtopic } from "@/services/subtopicService"
import { getTopics } from "@/services/topicService"
import { toast } from "sonner"

type TopicOption = { id: string | number; name: string }

export default function Home() {
  const [nombre, setNombre] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [topics, setTopics] = useState<TopicOption[]>([])
  const [topicQuery, setTopicQuery] = useState("")
  const [selectedTopic, setSelectedTopic] = useState<TopicOption | null>(null)
  const [topicOpen, setTopicOpen] = useState(false)
  const [topicError, setTopicError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const topicIdParam = searchParams.get("topicId")

  useEffect(() => {
    getTopics()
      .then((list: any[]) =>
        setTopics(
          list.map((t) => ({
            id: t.id,
            name: (t.nombre || t.name || "").toString(),
          }))
        )
      )
      .catch((err) => {
        console.error(err)
        toast.error("Error de Carga", {
          description: "No se pudieron cargar los temas disponibles.",
        })
      })
  }, [])

  useEffect(() => {
    if (!topicIdParam || topics.length === 0 || selectedTopic) return
    const found = topics.find((t) => String(t.id) === String(topicIdParam))
    if (found) {
      setSelectedTopic(found)
      setTopicQuery(found.name)
      setTopicOpen(false)
      setTopicError(null)
    }
  }, [topicIdParam, topics, selectedTopic])

  const visibleTopics = topics.filter((t) =>
    t.name.toLowerCase().includes(topicQuery.trim().toLowerCase())
  )

  const selectTopic = (t: TopicOption) => {
    setSelectedTopic(t)
    setTopicQuery(t.name)
    setTopicOpen(false)
    setTopicError(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!nombre.trim()) return
    if (!selectedTopic) {
      setTopicError("Selecciona un tema de la lista.")
      setTopicOpen(true)
      return
    }

    setIsLoading(true)
    try {
      await postSubtopic(
        ({ name: nombre.trim(), ...(selectedTopic ? { topic_id: selectedTopic.id } : {}) } as any)
      )
      toast.success("Subtema creado", {
        description: `El subtema "${nombre.trim()}" se creó correctamente.`,
      })
      router.push(`/dashboard/head_teacher/subtopic`)
      setNombre("")
      setSelectedTopic(null)
      setTopicQuery("")
    } catch (err) {
      console.error(err)
      alert("Hubo un error al crear el subtema.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <div>
            <h2 className="font-semibold leading-none">Nuevo Subtema</h2>
          </div>

          <FieldGroup>
            <FieldSet>
              <Field>
                <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
                <Input
                  id="nombre"
                  placeholder="Nombre del subtema"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="tema">Tema</FieldLabel>
                <div className="relative">
                  <Input
                    id="tema"
                    placeholder="Escribe para buscar y selecciona un tema"
                    value={topicQuery}
                    onFocus={() => setTopicOpen(true)}
                    onChange={(e) => {
                      setTopicQuery(e.target.value)
                      setSelectedTopic(null)
                      setTopicError(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        const exact = topics.find(
                          (t) => t.name.toLowerCase() === topicQuery.trim().toLowerCase()
                        )
                        if (exact) {
                          selectTopic(exact)
                          return
                        }
                        if (visibleTopics.length === 1) {
                          selectTopic(visibleTopics[0])
                        }
                      } else if (e.key === "Escape") {
                        setTopicOpen(false)
                      }
                    }}
                    aria-invalid={!!topicError}
                  />
                  {topicOpen && (
                    <div
                      className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <ul className="max-h-60 overflow-auto py-1">
                        {(topicQuery.trim() ? visibleTopics : topics).map((t) => (
                          <li key={t.id}>
                            <button
                              type="button"
                              className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground"
                              onClick={() => selectTopic(t)}
                            >
                              {t.name}
                            </button>
                          </li>
                        ))}
                        {topics.length === 0 && (
                          <li className="px-3 py-2 text-sm text-muted-foreground">No hay temas.</li>
                        )}
                        {topics.length > 0 &&
                          (topicQuery.trim() ? visibleTopics.length === 0 : false) && (
                            <li className="px-3 py-2 text-sm text-muted-foreground">
                              Sin resultados para “{topicQuery}”.
                            </li>
                          )}
                      </ul>
                    </div>
                  )}
                </div>
                {topicError && (
                  <p className="mt-1 text-sm text-destructive">{topicError}</p>
                )}
              </Field>
            </FieldSet>
          </FieldGroup>

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading || !nombre.trim()}>
              {isLoading ? "Creando..." : "Crear Subtema"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/head_teacher/subtopic")}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </main>
  )
}