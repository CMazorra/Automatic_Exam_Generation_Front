"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getExams, deleteExam } from "@/services/examService"
import { ListViewWithAdd } from "@/components/list-view-with-add"
import { Button } from "@/components/ui/button"

interface Exam {
  id: number
  name: string
  status: string
  difficulty: string
  subject_id: number
  teacher_id: number
  parameters_id: number
  head_teacher_id: number
}

export default function TeacherExamListPage() {
  const router = useRouter()
  const [exams, setExams] = useState<Exam[]>([])

  useEffect(() => {
    // Más adelante filtramos por teacher_id
    getExams()
      .then(data => setExams(Array.isArray(data) ? data : []))
      .catch(console.error)
  }, [])

  return (
    <ListViewWithAdd
      title="Exámenes"
      entities={exams}
      sortFields={[
        { value: "name", label: "Nombre" },
        { value: "difficulty", label: "Dificultad" }
      ]}
      filterFields={[
        { value: "status", label: "Estado" }
      ]}
      renderEntity={(exam) => (
        <div className="rounded-lg border border-border bg-card p-4 hover:bg-accent/5">
          <h3 className="font-semibold text-sm text-card-foreground">{exam.name}</h3>

          <div className="flex gap-2 text-xs mt-1">
            <span className="px-2 py-0.5 rounded bg-muted">
              {exam.difficulty}
            </span>
            <span
              className={`px-2 py-0.5 rounded ${
                exam.status === "PUBLISHED"
                  ? "bg-green-200 text-green-800"
                  : exam.status === "DRAFT"
                  ? "bg-yellow-200 text-yellow-800"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {exam.status}
            </span>
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/teacher/exam/${exam.id}`)}
            >
              Ver detalles
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/teacher/exam/${exam.id}/edit`)}
            >
              Editar
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                if (!confirm("¿Eliminar examen?")) return
                try {
                  await deleteExam(exam.id)
                  setExams(e => e.filter(x => x.id !== exam.id))
                } catch (err: any) {
                  alert(err.message || "Error al eliminar")
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        </div>
      )}
      onAdd={() => router.push("/dashboard/teacher/exam/new")}
    />
  )
}
