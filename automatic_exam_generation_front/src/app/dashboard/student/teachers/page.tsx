"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ListView } from "@/components/list-view"
import { getCurrentUser } from "@/services/authService"
import { getTeachers } from "@/services/teacherService"
import { getSubjectsFlatByTeacherID, getSubjectsByStudentID, getSubjects } from "@/services/subjectService"
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

      const extractSubjects = (v: any): any[] => {
        if (v == null) return []
        if (Array.isArray(v)) return v
        if (typeof v === "object") {
          if (Array.isArray(v.subjects)) return v.subjects
          // some services might return { data: [...] }
          if (Array.isArray((v as any).data)) return (v as any).data
        }
        // single subject object
        if (typeof v === "object" && (v.id || v._id || v.subject_id || v.id_subject)) return [v]
        return []
      }

      try {
        const current = await getCurrentUser()
        const currentId = current?.id ?? current?.id_us ?? current?._id
        
        const allSubjects = await getSubjects()
        const allSubjectsArray = Array.isArray(allSubjects)
          ? allSubjects
          : Array.isArray((allSubjects as any)?.data)
            ? (allSubjects as any).data
            : []
        
        if (!currentId) {
          const all = await getTeachers()
          const enriched = await Promise.all(
            (all || []).map(async (t: any) => {
              const normalized = normalizeTeacher(t)
              const tid = normalized.id_us ?? normalized.id ?? normalized._id
              const rawSubjects = await getSubjectsFlatByTeacherID(String(tid)).catch(() => [])
              const subjectsArray = extractSubjects(rawSubjects)

              const headSubjects = allSubjectsArray
                .filter((s: any) => String(s.head_teacher_id) === String(tid))
                .map((s: any) => s.name)
                .filter(Boolean)

              const teacherSubjects = subjectsArray.map((s: any) => s.name ?? s.subject_name).filter(Boolean)

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

        const mySubjectsRaw = await getSubjectsByStudentID(String(currentId))
        const mySubjectsArray = extractSubjects(mySubjectsRaw)
        const mySubjectIds = new Set(
          (mySubjectsArray || []).map((s: any) => String(s.id ?? s._id ?? s.subject_id ?? s.id_subject))
        )

        const allTeachers = await getTeachers()

        const teachersWithCommon = await Promise.all(
          (allTeachers || []).map(async (t: any) => {
            const normalized = normalizeTeacher(t)
            const tid = normalized.id_us ?? normalized.id ?? normalized._id
            const rawSubjects = await getSubjectsFlatByTeacherID(String(tid)).catch(() => [])
            const subjectsArray = extractSubjects(rawSubjects)

            const headSubjects = allSubjectsArray
              .filter((s: any) => String(s.head_teacher_id) === String(tid))
              .map((s: any) => s.name)
              .filter(Boolean)

            const teacherSubjects = subjectsArray.map((s: any) => s.name ?? s.subject_name).filter(Boolean)

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
            // include teachers with any overlap (as teacher or head) by subject id
            const subjectIds = new Set((subjects || []).map((s: any) => String(s.id ?? s._id ?? s.subject_id ?? s.id_subject)))
            return [...subjectIds].some((sid) => mySubjectIds.has(sid))
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
