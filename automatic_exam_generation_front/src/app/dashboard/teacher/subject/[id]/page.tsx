"use client"

import React, { useEffect, useState, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getSubjectById } from "@/services/subjectService"
import { getTopicsBySubjectId } from "@/services/topicService"
import { getHeadTeacherByID } from "@/services/headTeacerService"
import { getTeachers } from "@/services/teacherService"

interface Subject {
  id: number | string
  name?: string
  program?: string
  head_teacher_id?: number | string
}

interface Topic {
  id: string | number
  name?: string
  nombre?: string
}

export default function SubjectView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [subject, setSubject] = useState<Subject | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [isLoadingSubject, setIsLoadingSubject] = useState(true)
  const [isLoadingTopics, setIsLoadingTopics] = useState(true)
  const [headTeacherName, setHeadTeacherName] = useState<string | null>(null)
  const [isLoadingHead, setIsLoadingHead] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSubjectById(Number(id))
        setSubject(data)
      } catch (e) {
        console.error("Error fetching subject:", e)
      } finally {
        setIsLoadingSubject(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const all = await getTopicsBySubjectId(String(id))
        setTopics(all || [])
      } catch (e) {
        console.error("Error fetching topics by subject:", e)
      } finally {
        setIsLoadingTopics(false)
      }
    }
    loadTopics()
  }, [id])

  // Cargar nombre del jefe de asignatura
  useEffect(() => {
    const loadHeadName = async () => {
      const headId = subject?.head_teacher_id
      if (!headId) {
        setHeadTeacherName(null)
        return
      }
      setIsLoadingHead(true)
      try {
        const ht = await getHeadTeacherByID(Number(headId))
        let name =
          ht?.teacher?.user?.name ||
          ht?.teacher?.user?.nombre ||
          ht?.teacher?.name ||
          ht?.teacher?.nombre ||
          null

        if (!name) {
          // Fallback: buscar en lista de teachers
          const teachers = await getTeachers()
          const match = (teachers || []).find((t: any) => String(t.id) === String(headId))
          name = match?.user?.name || match?.user?.nombre || null
        }

        setHeadTeacherName(name)
      } catch (e) {
        console.error("Error fetching head teacher:", e)
        setHeadTeacherName(null)
      } finally {
        setIsLoadingHead(false)
      }
    }

    loadHeadName()
  }, [subject?.head_teacher_id])

  if (isLoadingSubject) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">Cargando asignatura...</div>
      </main>
    )
  }

  if (!subject) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center text-destructive">Asignatura no encontrada</div>
      </main>
    )
  }

  const displayName = subject.name || "(Sin nombre)"

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Card de detalles de la asignatura */}
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="font-semibold leading-none text-xl">{displayName}</h2>

          <div className="grid gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Programa</div>
              <p className="mt-1 whitespace-pre-wrap">
                {subject.program || "(Sin programa)"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Jefe de asignatura</div>
              <div className="font-medium">
                {isLoadingHead
                  ? "Cargando..."
                  : headTeacherName || `(ID: ${subject.head_teacher_id ?? "—"})`}
              </div>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link href="/dashboard/teacher/subject">
              <Button variant="outline">Volver</Button>
            </Link>
          </div>
        </div>

        {/* Card de Topics de la asignatura */}
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Temas</h3>
            <Button
              size="sm"
              onClick={() =>
                router.push(
                  `/dashboard/teacher/topic/new?subjectId=${subject.id}&returnTo=${encodeURIComponent(
                    `/dashboard/teacher/subject/${subject.id}`
                  )}`
                )
              }
            >
              Añadir tema
            </Button>
          </div>

          {isLoadingTopics && (
            <div className="text-sm text-muted-foreground">Cargando temas...</div>
          )}

          {!isLoadingTopics && topics.length === 0 && (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              No hay temas para esta asignatura.
            </div>
          )}

          {!isLoadingTopics && topics.length > 0 && (
            <div className="space-y-3">
              {topics.map((t) => (
                <div
                  key={t.id}
                  className="rounded-md border bg-muted/30 hover:bg-muted transition-colors p-4 flex items-center justify-between"
                >
                  <div className="font-medium">{t.name || t.nombre || "(Sin nombre)"}</div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/dashboard/teacher/topic/${t.id}`)}
                    >
                      Ver
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/dashboard/teacher/topic/${t.id}/edit`)}
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}