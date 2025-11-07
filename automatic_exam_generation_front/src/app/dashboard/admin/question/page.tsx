"use client"

import { useEffect, useState } from "react"
import { ListViewWithAdd } from "@/components/list-view-with-add"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getQuestions } from "@/services/questionService"

export default function SubjectPage() {
    const router = useRouter()
    const [entities, setEntities] = useState<any[]>([])
    useEffect(() => {
    getQuestions().then(setEntities).catch(console.error)
  }, [])
  return (
    <ListViewWithAdd
      title="Lista de Preguntas"
      entities = {entities}
      sortFields={[
        { value: "difficulty", label: "Dificultad" },
        { value: "type", label: "Tipo" },
        //{ value: "subject", label: "Asignatura" },
        { value: "date", label: "Fecha" },
      ]}
      filterFields={[
        { value: "difficulty", label: "Dificultad" },
        { value: "type", label: "Tipo" },
        //{ value: "subject", label: "Asignatura" },
        { value: "date", label: "Fecha" },
      ]}
      renderEntity={(question) => (
        <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-card-foreground">{question.name}</h3>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Tipo: ${question.type}</span>
                <span>Dificultad: ${question.difficulty}</span>
                <span>Fecha: {question.date}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/admin/question/${question.id}`)}>
              Ver detalles
            </Button>
          </div>
        </div>
      )}
      onAdd={() => router.push("/dashboard/admin/question/new")}
    />
  )
}