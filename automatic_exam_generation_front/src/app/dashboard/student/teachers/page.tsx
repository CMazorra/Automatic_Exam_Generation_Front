"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ListView } from "@/components/list-view"
import { getCurrentUser } from "@/services/authService"
import { getTeachers } from "@/services/teacherService"
import { getSubjectsByTeacherID, getSubjectsByStudentID, getSubjects } from "@/services/subjectService"
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
        
        const allSubjects = await getSubjects()
        const allSubjectsArray = Array.isArray(allSubjects) ? allSubjects : []
        
        if (!currentId) {
          const all = await getTeachers()
          const enriched = await Promise.all(
            (all || []).map(async (t: any) => {
              const normalized = normalizeTeacher(t)
              const tid = normalized.id_us ?? normalized.id ?? normalized._id
              const subjects = await getSubjectsByTeacherID(String(tid)).catch(() => [])
              const subjectsArray = Array.isArray(subjects) ? subjects : []

              const headSubjects = allSubjectsArray
                .filter((s: any) => String(s.head_teacher_id) === String(tid))
                .map((s: any) => s.name)
                .filter(Boolean)

              const teacherSubjects = subjectsArray.map((s: any) => s.name).filter(Boolean)

              const allSubjectsNames = [...new Set([...teacherSubjects, ...headSubjects])].join(" | ")
              const headSubjectsNames = headSubjects.join(" | ")

              return {
                ...normalized,
                teacher_subjects_names: allSubjectsNames,
                head_subjects_names: headSubjectsNames,
              }
            })
          )
          setUsers(enriched)
          return
        }

        const mySubjects = await getSubjectsByStudentID(String(currentId))
        const mySubjectIds = new Set(
          (mySubjects || []).map((s: any) => String(s.id ?? s._id ?? s.subject_id ?? s.id_subject))
        )

        const allTeachers = await getTeachers()

        const teachersWithCommon = await Promise.all(
          (allTeachers || []).map(async (t: any) => {
            const normalized = normalizeTeacher(t)
            const tid = normalized.id_us ?? normalized.id ?? normalized._id
            const subjects = await getSubjectsByTeacherID(String(tid)).catch(() => [])
            const subjectsArray = Array.isArray(subjects) ? subjects : []

            const headSubjects = allSubjectsArray
              .filter((s: any) => String(s.head_teacher_id) === String(tid))
              .map((s: any) => s.name)
              .filter(Boolean)

            const teacherSubjects = subjectsArray.map((s: any) => s.name).filter(Boolean)

            const allSubjectsNames = [...new Set([...teacherSubjects, ...headSubjects])].join(" | ")
            const headSubjectsNames = headSubjects.join(" | ")

            return {
              teacher: {
                ...normalized,
                teacher_subjects_names: allSubjectsNames,
                head_subjects_names: headSubjectsNames,
              },
              subjects: subjectsArray,
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
      title="Lista de Profesores"
      entities={users}
      sortFields={[{ value: "name", label: "Nombre" }]}
      filterFields={[
        { value: "name", label: "Nombre" },
        { value: "teacher_subjects_names", label: "Asignatura" },
        { value: "head_subjects_names", label: "Jefe de Asignatura" },
      ]}
      renderEntity={(user) => (
        <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-card-foreground">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.account}</p>
                <div className="ml-auto flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/student/teachers/${user.id_us}`)}>
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
