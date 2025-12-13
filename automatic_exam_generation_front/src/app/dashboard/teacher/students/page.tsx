"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ListView } from "@/components/list-view"
import { getCurrentUser } from "@/services/authService"
import { getStudents } from "@/services/studentService"
import { getSubjectsFlatByTeacherID, getSubjectsByStudentID } from "@/services/subjectService"
import { Button } from "@/components/ui/button"

export default function StudentsPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const ensureArray = (val: any) => {
      if (Array.isArray(val)) return val
      if (!val) return []
      if (Array.isArray(val.data)) return val.data
      if (Array.isArray(val.subjects)) return val.subjects
      if (val && typeof val === "object") {
        for (const key of ["subjects", "data", "items"]) {
          if (Array.isArray(val[key])) return val[key]
        }
      }
      return []
    }

    const normalizeStudent = (s: any) => {
      const user = s.user ?? s
      const id_us = s.id_us ?? s.id ?? s._id ?? user.id_us ?? user.id ?? ""
      const name =
        user.name ??
        user.fullName ??
        user.full_name ??
        (user.first_name || user.last_name ? [user.first_name, user.last_name].filter(Boolean).join(" ") : undefined) ??
        user.username ??
        user.account ??
        "Sin nombre"
      const account = user.account ?? user.username ?? user.email ?? ""
      const role = user.role ?? s.role ?? "Estudiante"
      return { ...s, id_us: String(id_us), name, account, role, user }
    }

    const fetchStudentsSharedSubjects = async () => {
      try {
        const current = await getCurrentUser()
        const currentId = String(current?.id ?? current?.id_us ?? current?._id ?? "")

        if (!currentId) {
          const all = await getStudents()
          setUsers((all || []).map((s: any) => normalizeStudent(s)))
          setIsLoading(false)
          return
        }

        const mySubjectsRaw = await getSubjectsFlatByTeacherID(String(currentId)).catch(() => [])
        const mySubjects = ensureArray(mySubjectsRaw)
        const mySubjectIds = new Set(
          mySubjects.map((s: any) => String(s.id ?? s._id ?? s.subject_id ?? s.id_subject)).filter(Boolean)
        )

        const allStudents = await getStudents()
        const studentsWithSubjects = await Promise.all(
          (allStudents || []).map(async (st: any) => {
            const sid = st.id ?? st.id_us ?? st._id ?? (st.user && (st.user.id ?? st.user.id_us)) ?? ""
            const subjectsRaw = sid ? await getSubjectsByStudentID(String(sid)).catch(() => []) : []
            const subjects = ensureArray(subjectsRaw)
            return {
              student: normalizeStudent(st),
              subjects,
            }
          })
        )

        const filtered = studentsWithSubjects
          .filter(({ student, subjects }) => {
            const sid = String(student.id_us ?? student.id ?? student._id ?? "")
            if (!sid || sid === currentId) return false
            return (subjects || []).some((s: any) =>
              mySubjectIds.has(String(s.id ?? s._id ?? s.subject_id ?? s.id_subject ?? ""))
            )
          })
          .map(({ student }) => student)

        setUsers(filtered)
      } catch (error) {
        console.error("Error fetching students with common subjects:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudentsSharedSubjects()
  }, [])

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">Cargando estudiantes...</div>
      </main>
    )
  }

  return (
    <ListView
      title="Lista de Estudiantes"
      entities={users}
      sortFields={[{ value: "name", label: "Nombre" }]}
      filterFields={[{ value: "name", label: "Nombre" }]}
      renderEntity={(user) => (
        <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-card-foreground">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.account}</p>
                <div className="ml-auto flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/teacher/students/${user.id_us}`)}>
                  Ver detalles
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    />
  )
}