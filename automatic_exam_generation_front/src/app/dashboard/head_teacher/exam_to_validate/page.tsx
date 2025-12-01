"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getExams } from "@/services/examService"
import { getApprovedExams } from "@/services/approvedExamService"
import { ListView } from "@/components/list-view"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/services/authService"

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

export default function HeadTeacherExamToValidatePage() {
  const router = useRouter()
  const [exams, setExams] = useState<Exam[]>([])

  useEffect(() => {
    async function loadUserAndExams() {
      try {
        let uid: number | null = null
        try {
          const user = await getCurrentUser()
          uid = user?.id ?? null
        } catch {
          const raw = typeof window !== "undefined" ? localStorage.getItem("userId") : null
          uid = raw ? Number(raw) : null
        }

        const data = await getExams()
        const list = Array.isArray(data) ? data : []
        
        // Obtener exámenes aprobados
        const approvedData = await getApprovedExams()
        const approvedList = Array.isArray(approvedData) ? approvedData : []
        const approvedExamIds = new Set(approvedList.map((ae: any) => Number(ae.exam_id)))
        
        // Filtra por head_teacher_id, estado "Pendiente" y excluye los que ya están aprobados
        const filtered = uid != null 
          ? list.filter(x => 
              x.head_teacher_id === uid && 
              x.status?.toLowerCase() === "pendiente" &&
              !approvedExamIds.has(x.id)
            )
          : []
        
        setExams(filtered)
      } catch (e) {
        console.error(e)
        setExams([])
      }
    }

    loadUserAndExams()
  }, [])

  return (
    <ListView
      title="Exámenes a validar"
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
          {/* Fila de encabezado: título a la izquierda, botón a la derecha */}
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-sm text-card-foreground">{exam.name}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/head_teacher/exam_to_validate/${exam.id}`)}
            >
              Ver detalles
            </Button>
          </div>

          <div className="flex gap-2 text-xs mt-2">
            <span className="px-2 py-0.5 rounded bg-muted">
              {exam.difficulty}
            </span>
            <span className="px-2 py-0.5 rounded bg-yellow-200 text-yellow-800">
              {exam.status}
            </span>
          </div>
        </div>
      )}
    />
  )
}
