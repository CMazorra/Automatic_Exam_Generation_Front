"use client"

import { useEffect, useState } from "react"
import { ListView } from "@/components/list-view"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/services/authService"
import { getSubjectsByTeacherID } from "@/services/subjectService"

export default function SubjectPage() {
  const router = useRouter()
  const [entities, setEntities] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const user = await getCurrentUser()
        const teacherId = user?.id ?? user?.id_us ?? user?._id
        if (!teacherId) {
          if (mounted) setEntities([])
          return
        }
        const subjects = await getSubjectsByTeacherID(String(teacherId))
        if (mounted) setEntities(Array.isArray(subjects) ? subjects : [])
      } catch (err) {
        console.error("Error cargando asignaturas del profesor:", err)
        if (mounted) setEntities([])
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
      ]}
      filterFields={[
        { value: "name", label: "Nombre" },
      ]}
      renderEntity={(subject) => (
        <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-card-foreground">{subject.name}</h3>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/teacher/subject/${subject.id ?? subject._id ?? subject.subject_id}`)}>
              Ver detalles
            </Button>
          </div>
        </div>
      )}
      onAdd={() => router.push("/dashboard/teacher/subject/new")}
    />
  )
}