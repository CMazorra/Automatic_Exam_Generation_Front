"use client"

import { useEffect, useState } from "react"
import { ListViewWithAdd } from "@/components/list-view-with-add"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getTopics } from "@/services/topicService"

export default function TopicPage() {
    const router = useRouter()
    const [entities, setEntities] = useState<any[]>([])
    useEffect(() => {
    getTopics().then(setEntities).catch(console.error)
  }, [])
  return (
    <ListViewWithAdd
      title="Lista de Temas"
      entities = {entities}
      sortFields={[
        { value: "name", label: "Nombre" },
      ]}
      filterFields={[
        { value: "name", label: "Nombre" },
      ]}
      renderEntity={(topic) => (
        <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-card-foreground">{topic.name}</h3>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/admin/topic/${topic.id}`)}>
              Ver detalles
            </Button>
          </div>
        </div>
      )}
      onAdd={() => router.push("/dashboard/admin/topic/new")}
    />
  )
}