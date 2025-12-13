"use client"

import React, { useEffect, useState , use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getTeacherByID } from "@/services/teacherService"
import { getSubjects,getSubjectsFlatByTeacherID } from "@/services/subjectService"

interface Teacher {
  id: number | string
  user?: {
    id_us?: number | string
    name?: string
    account?: string
  }
  isHeadTeacher?: boolean
  specialty?: string
}

interface Subject {
  id: number | string
  name?: string
  program?: string
  head_teacher_id?: number | string
}

export default function TeacherView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [allSubjects,setAllSubjects] = useState<Subject[]>([])
  const [isLoadingTeacher, setIsLoadingTeacher] = useState(true)
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getTeacherByID(Number(id))
        setTeacher(data)
      } catch (e) {
        console.error("Error fetching teacher:", e)
      } finally {
        setIsLoadingTeacher(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    const loadSubjectsByTeacher = async () => {
      try {
        const all = await getSubjectsFlatByTeacherID(String(id))
        setSubjects(all || [])
      } catch (e) {
        console.error("Error fetching subjects by teacher:", e)
      } finally {
        setIsLoadingSubjects(false)
      }
    }
    loadSubjectsByTeacher()
  }, [id])

  useEffect(() => {
    const loadAllSubjects = async () => {
      try {
        const all = await getSubjects()
        setAllSubjects(all || [])
      } catch (e) {
        console.error("Error fetching all subjects:", e)
      }
    }
    loadAllSubjects()
  }, [])

  if (isLoadingTeacher) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">Cargando profesor...</div>
      </main>
    )
  }
    
  if (!teacher) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center text-destructive">Profesor no encontrado</div>
      </main>
    )
  }

  const headSubjects: Subject[] = []
  
  for (const subject of allSubjects) {
    if (subject.head_teacher_id === teacher.id) {
      headSubjects.push(subject)
    }
  }

  console.log("Head Subjects:", headSubjects)
  console.log("All Subjects:", allSubjects)
  console.log("Teacher ID:", teacher.id)
  console.log("Subjects by Teacher:", subjects)

  const displayName = teacher.user?.name || "(Sin nombre)"

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="font-semibold leading-none text-xl">{displayName}</h2>

          <div className="grid gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Cuenta</div>
              <p className="mt-1 whitespace-pre-wrap">
                {teacher.user?.account || "(Sin cuenta)"}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Especialidad</div>
              <p className="mt-1 whitespace-pre-wrap">
                {teacher.specialty || "(Sin especialidad)"}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Jefe de asignatura</div>
              <div className="mt-1">
                {isLoadingSubjects ? (
                  <p className="text-sm text-muted-foreground">Comprobando asignaturas...</p>
                ) : headSubjects.length === 0 ? (
                  <p className="mt-1 whitespace-pre-wrap">No es jefe de asignatura</p>
                ) : (
                  <ul className="mt-1 list-disc pl-5">
                    {headSubjects.map((s) => (
                      <li key={s.id}>{s.name || "(Sin nombre)"}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Asignaturas que imparte</div>
              <div className="mt-1">
                {isLoadingSubjects ? (
                  <p className="text-sm text-muted-foreground">Comprobando asignaturas...</p>
                ) : headSubjects.length === 0 ? (
                  <p className="mt-1 whitespace-pre-wrap">No imparte asignaturas</p>
                ) : (
                  <ul className="mt-1 list-disc pl-5">
                    {subjects.map((s) => (
                      <li key={s.id}>{s.name || "(Sin nombre)"}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link href="/dashboard/head_teacher/teachers">
              <Button variant="outline">Volver</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}