"use client"

import { useEffect, useState } from "react"
import { ListView } from "@/components/list-view"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/services/authService"
import { getSubjectsByTeacherID } from "@/services/subjectService"
import { getHeadTeacherByID } from "@/services/headTeacerService"
import { getTopicsBySubjectId } from "@/services/topicService"

export default function SubjectPage() {
  const router = useRouter()
  const [entities, setEntities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const user = await getCurrentUser()
        const teacherId = user?.id ?? user?.id_us ?? user?._id
        if (!teacherId) {
          if (mounted) setEntities([])
          return
        }
        const subjects = await getSubjectsByTeacherID(String(teacherId))
        const subjectsArray = Array.isArray(subjects) ? subjects : []
        
        const enrichedSubjects = await Promise.all(
          subjectsArray.map(async (subject) => {
            try {
              const subjectId = subject.id ?? subject._id ?? subject.subject_id
              
              let headTeacherName = "Sin asignar"
              if (subject.head_teacher_id) {
                try {
                  const headTeacher = await getHeadTeacherByID(subject.head_teacher_id)
                  headTeacherName = headTeacher?.teacher?.user?.name || "Sin asignar"
                } catch (err) {
                  console.error(`Error obteniendo jefe de asignatura para ${subject.name}:`, err)
                  headTeacherName = "Error al cargar"
                }
              }

              let topics: any[] = []
              let topicsNames = ""
              if (subjectId) {
                try {
                  const topicsData = await getTopicsBySubjectId(String(subjectId))
                  topics = Array.isArray(topicsData) ? topicsData : []
                  topicsNames = topics.map(t => t.name).join(" | ")
                } catch (err) {
                  console.error(`Error obteniendo temas para ${subject.name}:`, err)
                  topics = []
                  topicsNames = ""
                }
              }

              return {
                ...subject,
                head_teacher_name: headTeacherName,
                topics: topics,
                topics_names: topicsNames
              }
            } catch (err) {
              console.error(`Error procesando asignatura ${subject.name}:`, err)
              return {
                ...subject,
                head_teacher_name: "Error al cargar",
                topics: [],
                topics_names: ""
              }
            }
          })
        )
        
        if (mounted) setEntities(enrichedSubjects)
      } catch (err) {
        console.error("Error cargando asignaturas del profesor:", err)
        if (mounted) setEntities([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <ListView
      title="Lista de Asignaturas"
      entities={entities}
      sortFields={[
        { value: "name", label: "Nombre" },
        { value: "head_teacher_name", label: "Jefe de Asignatura" },
      ]}
      filterFields={[
        { value: "name", label: "Nombre" },
        { value: "head_teacher_name", label: "Jefe de Asignatura" },
        { value: "topics_names", label: "Tema" },
      ]}
      renderEntity={(subject) => (
        <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-card-foreground">{subject.name}</h3>
                {subject.head_teacher_name && (
                  <span className="text-sm text-muted-foreground">
                    Jefe: {subject.head_teacher_name}
                  </span>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/head_teacher/subject/${subject.id ?? subject._id ?? subject.subject_id}`)}>
              Ver detalles
            </Button>
          </div>
        </div>
      )}
    />
  )
}