"use client"

import { useEffect, useState } from "react"
import { ListViewWithAdd } from "@/components/list-view-with-add"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getSubtopics } from "@/services/subtopicService"

export default function SubtopicPage() {
    const router = useRouter()
    const [entities, setEntities] = useState<any[]>([])
    useEffect(() => {
    getSubtopics().then(setEntities).catch(console.error)
  }, [])
  return (
    <ListViewWithAdd
      title="Lista de Subtemas"
      entities = {entities}
      sortFields={[
        { value: "name", label: "Nombre" },
      ]}
      filterFields={[
        { value: "name", label: "Nombre" },
      ]}
      getEntityKey={(s) => `${s.id}:${s.topic_id}`}
      renderEntity={(subtopic) => (
        <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-card-foreground">{subtopic.name}</h3>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/teacher/subtopic/${subtopic.id}/${subtopic.topic_id}`)}>
              Ver detalles
            </Button>
          </div>
        </div>
      )}
      onAdd={() => router.push("/dashboard/teacher/subtopic/new")}
    />
  )
}