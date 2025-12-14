"use client"

import React, { useEffect, useState, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getTopicById, deleteTopic } from "@/services/topicService"
import { getSubtopics, deleteSubtopic } from "@/services/subtopicService"
import { toast } from "sonner" // <-- Importamos TOAST

interface Topic {
  id: string
  nombre?: string
  name?: string
}

export default function TopicView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [subtopics, setSubtopics] = useState<any[]>([])
  const [isLoadingTopic, setIsLoadingTopic] = useState(true)
  const [isLoadingSubs, setIsLoadingSubs] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const data = await getTopicById(id)
        setTopic(data)
      } catch (error) {
        console.error("Error fetching topic:", error)
        toast.error("Error de Carga", { description: "No se pudo cargar el tema." })
      } finally {
        setIsLoadingTopic(false)
      }
    }
    fetchTopic()
  }, [id])

  useEffect(() => {
    const fetchSubtopics = async () => {
      try {
        const all = await getSubtopics()
        const filtered = all.filter((s: any) => String(s.topic_id) === id)
        setSubtopics(filtered)
      } catch (e) {
        console.error("Error fetching subtopics:", e)
        toast.error("Error de Carga", { description: "No se pudieron cargar los subtemas asociados." })
      } finally {
        setIsLoadingSubs(false)
      }
    }
    fetchSubtopics()
  }, [id])

  const executeDelete = async () => {
    if (!topic) return Promise.reject("Tema no definido")

    setIsDeleting(true)
    try {
      // 1. Eliminar subtemas
      if (subtopics.length > 0) {
        await Promise.all(
          subtopics.map((s) => deleteSubtopic(s.id, s.topic_id))
        )
      }
      // 2. Eliminar tema
      await deleteTopic(topic.id)
      // 3. Redireccionar
      router.push(`/dashboard/head_teacher/topic`)
      return "Tema eliminado exitosamente."
    } catch (e) {
      console.error(e)
      return Promise.reject("No se pudo eliminar el tema.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDelete = async () => {
    if (!topic) return

    const confirmationMessage = subtopics.length > 0
      ? `Este tema tiene ${subtopics.length} subtema(s). Al confirmar, **se eliminarán todos los subtemas primero** y luego el tema principal. ¿Deseas continuar?`
      : "¿Estás seguro de que deseas eliminar este tema? Esta acción es irreversible."

    // Utilizamos toast.promise para manejar el ciclo de vida de la eliminación
    toast.promise(executeDelete(), {
      loading: 'Procesando eliminación...',
      success: (message) => {
        return message;
      },
      error: (error) => {
        return error;
      },
      description: confirmationMessage, // Usamos la descripción para el mensaje de confirmación/contexto
    });
  }

  if (isLoadingTopic) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">Cargando tema...</div>
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

  const displayName = topic.nombre || topic.name || "(Sin nombre)"

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="font-semibold leading-none text-xl">{displayName}</h2>
          <div className="flex gap-3 flex-wrap">
            <Link href="/dashboard/head_teacher/topic">
              <Button variant="outline">Volver</Button>
            </Link>
            <Link href={`/dashboard/head_teacher/topic/${topic.id}/edit`}>
              <Button>Editar</Button>
            </Link>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || isLoadingSubs}
              title={
                isLoadingSubs
                  ? "Cargando subtemas..."
                  : subtopics.length > 0
                  ? `Este tema tiene ${subtopics.length} subtemas. Se eliminarán primero.`
                  : undefined
              }
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Subtemas</h3>
            <Button
              size="sm"
              onClick={() =>
                router.push(
                  `/dashboard/head_teacher/subtopic/new?topicId=${topic.id}&returnTo=${encodeURIComponent(
                    `/dashboard/head_teacher/topic/${topic.id}`
                  )}`
                )
              }
            >
              Añadir subtema
            </Button>
          </div>

          {isLoadingSubs && (
            <div className="text-sm text-muted-foreground">Cargando subtemas...</div>
          )}

          {!isLoadingSubs && subtopics.length === 0 && (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              No hay subtemas asociados.
            </div>
          )}

          {!isLoadingSubs && subtopics.length > 0 && (
            <div className="space-y-3">
              {subtopics.map((s) => (
                <div
                  key={`${s.id}:${s.topic_id}`}
                  className="rounded-md border bg-muted/30 hover:bg-muted transition-colors p-4 flex items-center justify-between"
                >
                  <div className="font-medium">{s.name || s.nombre}</div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/dashboard/head_teacher/subtopic/${s.id}/${s.topic_id}`)}
                    >
                      Ver
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/dashboard/head_teacher/subtopic/${s.id}/${s.topic_id}/edit`)
                      }
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoadingSubs && subtopics.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Para eliminar el tema se eliminarán primero sus subtemas.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}