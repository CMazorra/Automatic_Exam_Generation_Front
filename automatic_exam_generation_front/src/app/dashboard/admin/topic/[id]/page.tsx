"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getTopicById, deleteTopic } from "@/services/topicService"
import { getSubtopics } from "@/services/subtopicService"

interface Topic {
  id: string
  nombre?: string
  name?: string
}

export default function TopicView({ params }: { params: { id: string } }) {
  const [topic, setTopic] = useState<Topic | null>(null)
  const [subtopics, setSubtopics] = useState<any[]>([])
  const [isLoadingTopic, setIsLoadingTopic] = useState(true)
  const [isLoadingSubs, setIsLoadingSubs] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const data = await getTopicById(params.id)
        setTopic(data)
      } catch (error) {
        console.error("Error fetching topic:", error)
      } finally {
        setIsLoadingTopic(false)
      }
    }
    fetchTopic()
  }, [params.id])

  useEffect(() => {
    const fetchSubtopics = async () => {
      try {
        const all = await getSubtopics()
        const filtered = all.filter((s: any) => String(s.topic_id) === params.id)
        setSubtopics(filtered)
      } catch (e) {
        console.error("Error fetching subtopics:", e)
      } finally {
        setIsLoadingSubs(false)
      }
    }
    fetchSubtopics()
  }, [params.id])

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
            <Link href="/dashboard/admin/topic">
              <Button variant="outline">Volver</Button>
            </Link>
            <Link href={`/dashboard/admin/topic/${topic.id}/edit`}>
              <Button>Editar</Button>
            </Link>
            <Button
              variant="destructive"
              onClick={() => {
                deleteTopic(topic.id)
                router.push(`/dashboard/admin/topic`)
              }}
            >
              Eliminar
            </Button>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Subtemas</h3>
            <Button
              size="sm"
              onClick={() => router.push(`/dashboard/admin/subtopic/new?topicId=${topic.id}`)}
            >
              Añadir subtema
            </Button>
          </div>

            {isLoadingSubs && <div className="text-sm text-muted-foreground">Cargando subtemas...</div>}

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
                        onClick={() => router.push(`/dashboard/admin/subtopic/${s.id}/${s.topic_id}`)}
                      >
                        Ver
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/admin/subtopic/${s.id}/${s.topic_id}/edit`)}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </main>
  )
}