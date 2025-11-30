"use client"

import { useEffect, useState } from "react"
import { ListViewWithAdd } from "@/components/list-view-with-add"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { getExams } from "@/services/examService"

export default function SubjectPage() {
    const router = useRouter()
    const [entities, setEntities] = useState<any[]>([])
    useEffect(() => {
    getExams().then(setEntities).catch(console.error)
  }, [])
  return (
    <ListViewWithAdd
      title="Lista de Examenes"
      entities = {entities}
      sortFields={[
        { value: "name", label: "Nombre" },
        { value: "difficulty", label: "Dificultad" },
        { value: "status", label: "Estado" },
        { value: "subject", label: "Asignatura" },
        { value: "date", label: "Fecha" },
      ]}
      filterFields={[
        { value: "name", label: "Nombre" },
        { value: "difficulty", label: "Dificultad" },
        { value: "status", label: "Estado" },
        { value: "subject", label: "Asignatura" },
        { value: "date", label: "Fecha" },
      ]}
      renderEntity={(exam) => (
        <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-card-foreground">{exam.name}</h3>
                <Badge
                  variant={
                    exam.status === "Active" ? "default" : exam.status === "Pending" ? "secondary" : "outline"
                  }
                >
                  {exam.status}
                </Badge>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Asignatura: ${exam.subject}</span>
                <span>Dificultad: ${exam.difficulty}</span>
                <span>Fecha: {exam.date}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/admin/exam/${exam.id}`)}>
              Ver detalles
            </Button>
          </div>
        </div>
      )}
      onAdd={() => router.push("/dashboard/admin/exam/new")}
    />
  )
}