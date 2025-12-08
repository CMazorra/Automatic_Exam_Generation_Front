// src/app/dashboard/head_teacher/students/[id]/page.tsx

"use client"

import React, { useEffect, useState, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getStudentByID } from "@/services/studentService"
// Asumimos que getSubjectsByStudentID es la función correcta para obtener todas las asignaturas del alumno.
import { getSubjectsByStudentID } from "@/services/subjectService" 
import { Loader2 } from "lucide-react"

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

export default function StudentViewHeadTeacher({ params }: { params: Promise<{ id: string }> }) {
  // Uso de 'use' para desempacar la promesa de params
  const { id } = use(params) 
  
  const [student, setStudent] = useState<Student | null>(null)
  const [allSubjects, setAllSubjects] = useState<Subject[]>([])
  
  const [isLoadingStudent, setIsLoadingStudent] = useState(true)
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true)

  // Función utilitaria para extraer el array de asignaturas de la respuesta del servicio
  const extractSubjects = (v: any): Subject[] => {
    if (v == null) return []
    if (Array.isArray(v)) return v
    if (typeof v === "object") {
      // Si el backend devuelve { subjects: [...] }
      if (Array.isArray(v.subjects)) return v.subjects
    }
    return []
  }
    
  // Carga del estudiante
  useEffect(() => {
    const loadStudent = async () => {
      try {
        const data = await getStudentByID(Number(id))
        setStudent(data)
      } catch (e) {
        console.error("Error fetching student:", e)
      } finally {
        setIsLoadingStudent(false)
      }
    }
    loadStudent()
  }, [id])

  // Carga de TODAS las asignaturas del estudiante
  useEffect(() => {
    const loadSubjectsByStudent = async () => {
      try {
        const result = await getSubjectsByStudentID(String(id))
        setAllSubjects(extractSubjects(result))
      } catch (e) {
        console.error("Error fetching all student subjects:", e)
        setAllSubjects([])
      } finally {
        setIsLoadingSubjects(false)
      }
    }
    loadSubjectsByStudent()
  }, [id])

  const isLoading = isLoadingStudent || isLoadingSubjects

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando datos del estudiante...
        </div>
      </main>
    )
  }
    
  if (!student) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center text-destructive">Estudiante con ID {id} no encontrado.</div>
      </main>
    )
  }

  const displayName = student.user?.name || "(Sin nombre)"
  const hasSubjects = allSubjects.length > 0;

  // El Jefe de Estudios puede asignar un examen de CUALQUIER asignatura que el estudiante curse.
  // El link debe pasar todas las IDs de las asignaturas del alumno.
  const linkToAssignExam = hasSubjects
    ? `/dashboard/head_teacher/students/${id}/assign_exam?studentId=${id}&subjects=${allSubjects.map(s => s.id).join(',')}`
    : null;


  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold">Detalle de Estudiante</h1>
        
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="font-extrabold leading-none text-2xl text-primary">{displayName}</h2>

          {/* Sección de Cuenta */}
          <div className="grid gap-4 border-t pt-4">
            <div>
              <div className="text-sm text-muted-foreground">Cuenta</div>
              <p className="mt-1 whitespace-pre-wrap">
                {student.user?.account || "(Sin cuenta)"}
              </p>
            </div>
          </div>

          {/* Sección de Asignaturas */}
          <div className="grid gap-4 border-t pt-4">
            <div>
              <div className="text-sm text-muted-foreground">Asignaturas Cursadas</div>
              <div className="mt-1">
                {hasSubjects ? (
                  <ul className="mt-1 list-disc pl-5">
                    {allSubjects.map((s) => (
                      <li key={s.id} className="font-medium">{s.name || "(Sin nombre)"}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                    Este estudiante no tiene asignaturas asignadas en el sistema.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3 flex-wrap border-t pt-4">
            <Link href="/dashboard/head_teacher/students">
              <Button variant="outline">Volver a la Lista</Button>
            </Link>
            {hasSubjects && (
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