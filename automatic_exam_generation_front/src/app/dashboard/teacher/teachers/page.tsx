"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ListView } from "@/components/list-view"
import { getCurrentUser } from "@/services/authService"
import { getTeachers } from "@/services/teacherService"
import { getSubjectsByTeacherID } from "@/services/subjectService"
import { Button } from "@/components/ui/button"

export default function UserPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTeachersSharedSubjects = async () => {
      const normalizeTeacher = (t: any) => {
        const user = t.user ?? t
        const id_us = t.id_us ?? t.id ?? t._id ?? user.id_us ?? user.id
        const name = user.name ?? user.fullName ?? user.username ?? user.account ?? "Sin nombre"
        const account = user.account ?? user.username ?? user.email ?? ""
        const role = user.role ?? t.role ?? (t.isHeadTeacher ? "TEACHER" : "") ?? "TEACHER"
        return { ...t, id_us, name, account, role, user }
      }

      try {
        const current = await getCurrentUser()
        const currentId = current?.id ?? current?.id_us ?? current?._id
        if (!currentId) {
          const all = await getTeachers()
          setUsers((all || []).map((t: any) => normalizeTeacher(t)))
          return
        }

        const mySubjects = await getSubjectsByTeacherID(String(currentId))
        const mySubjectIds = new Set(
          (mySubjects || []).map((s: any) => String(s.id ?? s._id ?? s.subject_id ?? s.id_subject))
        )

        const allTeachers = await getTeachers()

        const teachersWithCommon = await Promise.all(
          (allTeachers || []).map(async (t: any) => {
            const tid = t.id ?? t.id_us ?? t._id ?? (t.user && (t.user.id ?? t.user.id_us))
            const subjects = await getSubjectsByTeacherID(String(tid)).catch(() => [])
            return {
              teacher: normalizeTeacher(t),
              subjects,
            }
          })
        )

        const filtered = teachersWithCommon
          .filter(({ teacher, subjects }) => {
            const tid = String(teacher.id_us ?? teacher.id ?? teacher._id)
            if (tid === String(currentId)) return false
            return (subjects || []).some((s: any) =>
              mySubjectIds.has(String(s.id ?? s._id ?? s.subject_id ?? s.id_subject))
            )
          })
          .map(({ teacher }) => teacher)

        setUsers(filtered)
      } catch (error) {
        console.error("Error fetching teachers with common subjects:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeachersSharedSubjects()
  }, [])

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">Cargando usuarios...</div>
      </main>
    )
  }

  return (
    <ListView
      title="Lista de Compañeros"
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
                  <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/teacher/teachers/${user.id_us}`)}>
                  Ver detalles
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}    />
  )
}
