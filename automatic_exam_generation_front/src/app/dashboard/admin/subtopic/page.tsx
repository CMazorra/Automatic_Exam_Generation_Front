"use client"

import { useEffect, useState } from "react"
import { ListViewWithAdd } from "@/components/list-view-with-add"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getSubtopics } from "@/services/subtopicService"
import { getTopicById } from "@/services/topicService"

export default function SubtopicPage() {
  const router = useRouter()
  const [entities, setEntities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const subtopics = await getSubtopics()
        const subtopicsArray = Array.isArray(subtopics) ? subtopics : []

        const topicNameCache = new Map<string, string>()

        const enrichedSubtopics = await Promise.all(
          subtopicsArray.map(async (subtopic: any) => {
            let topic_name = "Sin asignar"
            const tid = subtopic.topic_id
            if (tid != null) {
              const key = String(tid)
              if (topicNameCache.has(key)) {
                topic_name = topicNameCache.get(key) as string
              } else {
                try {
                  const topic = await getTopicById(key)
                  topic_name = topic?.name || "Sin asignar"
                  topicNameCache.set(key, topic_name)
                } catch {
                  topic_name = "Error al cargar"
                }
              }
            }
            return { ...subtopic, topic_name }
          })
        )

        if (mounted) setEntities(enrichedSubtopics)
      } catch (err) {
        console.error("Error cargando subtemas:", err)
        if (mounted) setEntities([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <ListViewWithAdd
      title="Lista de Subtemas"
      entities={entities}
      sortFields={[
        { value: "name", label: "Nombre" },
        { value: "topic_name", label: "Tema" },
      ]}
      filterFields={[
        { value: "name", label: "Nombre" },
        { value: "topic_name", label: "Tema" },
      ]}
      getEntityKey={(s) => `${s.id}:${s.topic_id}`}
      renderEntity={(subtopic) => (
        <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-card-foreground">{subtopic.name}</h3>
                {subtopic.topic_name && (
                  <span className="text-sm text-muted-foreground">Tema: {subtopic.topic_name}</span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/admin/subtopic/${subtopic.id}/${subtopic.topic_id}`)}
            >
              Ver detalles
            </Button>
          </div>
        </div>
      )}
      onAdd={() => router.push("/dashboard/admin/subtopic/new")}
    />
  )
}