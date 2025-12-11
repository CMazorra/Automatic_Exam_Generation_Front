"use client"

import React, { useEffect, useState , use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getStudentByID } from "@/services/studentService"
import { getCurrentUser } from "@/services/authService"
import { getSubjectsByTeacherID,getSubjectsByStudentID } from "@/services/subjectService"

interface Student {
  id: number | string
  user?: {
    id_us?: number | string
    name?: string
    account?: string
  }
}

interface Subject {
  id: number | string
  name?: string
}

export default function StudentView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [student, setStudent] = useState<Student | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teacherSubjects, setTeacherSubjects] = useState<Subject[]>([])
  const [isLoadingStudent, setIsLoadingStudent] = useState(true)
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true)
  const [isLoadingTeacherSubjects, setIsLoadingTeacherSubjects] = useState(true)

  const extractSubjects = (v: any): Subject[] => {
    if (v == null) return []
    if (Array.isArray(v)) return v
    if (typeof v === "object") {
      if (Array.isArray(v.subjects)) return v.subjects
    }
    return []
  }
  
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getStudentByID(Number(id))
        setStudent(data)
      } catch (e) {
        console.error("Error fetching student:", e)
      } finally {
        setIsLoadingStudent(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    const loadSubjectsByStudent = async () => {
      try {
        const all = await getSubjectsByStudentID(String(id))
        console.log("getSubjectsByStudentID raw:", all)
        setSubjects(extractSubjects(all))
      } catch (e) {
        console.error("Error fetching subjects by student:", e)
      } finally {
        setIsLoadingSubjects(false)
      }
    }
    loadSubjectsByStudent()
  }, [id])

  useEffect(() => {
    const loadTeacherSubjects = async () => {
      try {
        const current = await getCurrentUser()
        const teacherId =
          current?.id ??
          current?.id_us ??
          current?.teacherId ??
          current?.teacher_id ??
          current?.teacher?.id ??
          current?.user?.id
        if (teacherId) {
          const ts = await getSubjectsByTeacherID(String(teacherId))
          setTeacherSubjects(ts || [])
        } else {
          setTeacherSubjects([])
        }
      } catch (e) {
        console.error("Error fetching current user / teacher subjects:", e)
        setTeacherSubjects([])
      } finally {
        setIsLoadingTeacherSubjects(false)
      }
    }
    loadTeacherSubjects()
  }, [])

  if (isLoadingStudent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">Cargando estudiante...</div>
      </main>
    )
  }
    
  if (!student) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center text-destructive">Estudiante no encontrado</div>
      </main>
    )
  }

  const displayName = student.user?.name || "(Sin nombre)"

  const taughtSubjects: Subject[] = []
  
  for (const subject of subjects) {
    for (const tSubject of teacherSubjects) {
      if (subject.id === tSubject.id) {
        taughtSubjects.push(subject)
      }
    }
  }

  const hasTaughtSubjects = taughtSubjects.length > 0;

  const linkToAssignExam = hasTaughtSubjects
    ? `/dashboard/teacher/students/${id}/assign_exam?studentId=${id}&subjects=${taughtSubjects.map(s => s.id).join(',')}`
    : null;

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="font-semibold leading-none text-xl">{displayName}</h2>

          <div className="grid gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Cuenta</div>
              <p className="mt-1 whitespace-pre-wrap">
                {student.user?.account || "(Sin cuenta)"}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Asignaturas que le impartes</div>
              <div className="mt-1">
                {isLoadingSubjects || isLoadingTeacherSubjects ? (
                  <p className="text-sm text-muted-foreground">Comprobando asignaturas...</p>
                ) : taughtSubjects.length === 0 ? (
                  <p className="mt-1 whitespace-pre-wrap">El profesor logeado no imparte ninguna de las asignaturas de este estudiante.</p>
                ) : (
                  <ul className="mt-1 list-disc pl-5">
                    {taughtSubjects.map((s) => (
                      <li key={s.id}>{s.name || "(Sin nombre)"}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link href="/dashboard/teacher/teachers">
              <Button variant="outline">Volver</Button>
            </Link>
            {hasTaughtSubjects && (
              <Link href={linkToAssignExam!}>
                <Button variant="default">Asignar Examen</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}