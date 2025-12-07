// app/dashboard/teacher/exam/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getExams, deleteExam } from "@/services/examService"
import { getCurrentUser } from "@/services/authService"
import { getTeacherByID } from "@/services/teacherService"
import { ListViewWithAdd } from "@/components/list-view-with-add"
import { Button } from "@/components/ui/button"

interface Exam {
  id: number
  name: string
  status: string
  difficulty: string
  subject_id: number // Usaremos este campo para filtrar
  teacher_id: number
  parameters_id: number
  head_teacher_id: number
}

export default function TeacherExamListPage() {
  const router = useRouter()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true) // NUEVO: Estado de carga

  useEffect(() => {
    async function loadExams() {
      try {
        // 1. Obtener el ID del usuario actual (profesor)
        let finalUserId: number | null = null;
        try {
          const user = await getCurrentUser();
          finalUserId = user?.id ?? null;
        } catch (e) {
          // Fallback: Intenta obtener el ID del usuario de localStorage
          const rawUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
          finalUserId = rawUserId ? Number(rawUserId) : null;
        }

        if (!finalUserId) {
          console.error("No se pudo obtener el ID del usuario actual.");
          setExams([]);
          return
        }

        // 2. Obtener los detalles del profesor para saber qué asignatura(s) imparte
        // Asumimos que el ID de usuario es el mismo que el ID de profesor para getTeacherByID
        const teacherData = await getTeacherByID(finalUserId)
        
        // Obtener la lista de IDs de asignaturas del profesor (Adaptar a tu estructura de datos)
        let teacherSubjectIds: number[] = [];
        if (teacherData?.subjects && Array.isArray(teacherData.subjects)) {
          // Si el backend devuelve un array 'subjects' en el objeto teacher
          teacherSubjectIds = teacherData.subjects.map((s: any) => s.id).filter(Boolean);
        } else if (teacherData?.subject_id) {
          // Si el backend solo devuelve un 'subject_id' directo
          teacherSubjectIds = [teacherData.subject_id]; 
        }

        if (teacherSubjectIds.length === 0) {
          console.log("El profesor no tiene asignaturas asignadas.");
          setExams([]);
          return;
        }

        // 3. Obtener todos los exámenes
        const allExams: Exam[] = await getExams()
        
        // 4. Filtrar los exámenes (Requisito 3: todos los exámenes de la asignatura(s) del profesor)
        const filteredExams = allExams.filter(exam => 
          teacherSubjectIds.includes(exam.subject_id)
        );

        setExams(Array.isArray(filteredExams) ? filteredExams : [])
      } catch (e) {
        console.error("Error al cargar o filtrar exámenes", e)
        // alert("Error al cargar los exámenes.") // Opcional
      } finally {
        setLoading(false)
      }
    }
    
    loadExams()
  }, [])

  if (loading) return <p className="p-8">Cargando exámenes...</p>

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
              onClick={() => router.push(`/dashboard/head_teacher/exam/${exam.id}`)}
            >
              Ver detalles
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/head_teacher/exam/${exam.id}/edit`)}
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
      onAdd={() => router.push("/dashboard/head_teacher/exam/new")}
    />
  )
}