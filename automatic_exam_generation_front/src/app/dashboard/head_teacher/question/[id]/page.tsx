"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { getQuestionById } from "@/services/questionService"
import { getSubjectById } from "@/services/subjectService"
import { getTopicById } from "@/services/topicService"
import { getSubtopicById } from "@/services/subtopicService"
import { getTeacherByID } from "@/services/teacherService"
import { Button } from "@/components/ui/button"
import Link from "next/link"


interface Question {
  id: number | string
  question_text?: string
  difficulty?: string
  answer?: string
  type?: string
  subject_id?: number | string
  sub_topic_id?: number | string
  topic_id?: number | string
  teacher_id?: number | string
}

interface Subject {
  id: number | string
  name?: string
}

interface Topic {
  id: string | number
  name?: string
}

interface Subtopic {
  id: string | number
  name?: string
}

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

export default function QuestionView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [question, setQuestion] = useState<Question | null>(null)
  const [subject, setSubject] = useState<Subject | null>(null)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [subtopic, setSubtopic] = useState<Subtopic | null>(null)
  const [teacher, setTeacher] = useState<Teacher | null>(null)

  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true)
  const [isLoadingSubject, setIsLoadingSubject] = useState(true)
  const [isLoadingTopic, setIsLoadingTopic] = useState(true)
  const [isLoadingSubtopic, setIsLoadingSubtopic] = useState(true)
  const [isLoadingTeacher, setIsLoadingTeacher] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getQuestionById(String(id))
        setQuestion(data)
      } catch (e) {
        console.error("Error fetching question:", e)
      } finally {
        setIsLoadingQuestion(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    if (!question?.subject_id) {
      setIsLoadingSubject(false)
      return
    }
    let mounted = true
    const load = async () => {
      try {
        setIsLoadingSubject(true)
        const data = await getSubjectById(Number(question.subject_id))
        if (mounted) setSubject(data)
      } catch (e) {
        console.error("Error fetching subject:", e)
      } finally {
        if (mounted) setIsLoadingSubject(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [question?.subject_id])

  useEffect(() => {
    if (!question?.topic_id) {
      setIsLoadingTopic(false)
      return
    }
    let mounted = true
    const load = async () => {
      try {
        setIsLoadingTopic(true)
        const data = await getTopicById(String(question.topic_id))
        if (mounted) setTopic(data)
      } catch (e) {
        console.error("Error fetching topic:", e)
      } finally {
        if (mounted) setIsLoadingTopic(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [question?.topic_id])

  useEffect(() => {
    if (!question?.sub_topic_id || !question?.topic_id) {
      setIsLoadingSubtopic(false)
      return
    }
    let mounted = true
    const load = async () => {
      try {
        setIsLoadingSubtopic(true)
        const data = await getSubtopicById(String(question.sub_topic_id), String(question.topic_id))
        if (mounted) setSubtopic(data)
      } catch (e) {
        console.error("Error fetching subtopic:", e)
      } finally {
        if (mounted) setIsLoadingSubtopic(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [question?.sub_topic_id, question?.topic_id])

  useEffect(() => {
    if (!question?.teacher_id) {
      setIsLoadingTeacher(false)
      return
    }
    let mounted = true
    const load = async () => {
      try {
        setIsLoadingTeacher(true)
        const data = await getTeacherByID(String(question.teacher_id))
        if (mounted) setTeacher(data)
      } catch (e) {
        console.error("Error fetching teacher:", e)
      } finally {
        if (mounted) setIsLoadingTeacher(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [question?.teacher_id])
  if (isLoadingQuestion) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">Cargando pregunta...</div>
      </main>
    )
  }

  if (!question) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center text-destructive">Pregunta no encontrada</div>
      </main>
    )
  }

  const displayName = question.question_text || "(Sin texto)"

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="font-semibold leading-none text-xl">{displayName}</h2>

          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Dificultad</div>
              <p className="mt-1 whitespace-pre-wrap">
                {question.difficulty || "(Sin dificultad)"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Respuesta</div>
              <p className="mt-1 whitespace-pre-wrap">
                {question.answer || "(Sin respuesta)"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Tipo de pregunta</div>
              <p className="mt-1 whitespace-pre-wrap">
                {question.type || "(Sin tipo)"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Asignatura</div>
              {isLoadingSubject ? (
                <p className="mt-1 text-sm text-muted-foreground">Cargando asignatura...</p>
              ) : (
                <p className="mt-1 whitespace-pre-wrap">{subject?.name || "(Sin nombre)"}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Tema</div>
              {isLoadingTopic ? (
                <p className="mt-1 text-sm text-muted-foreground">Cargando tema...</p>
              ) : (
                <p className="mt-1 whitespace-pre-wrap">{topic?.name || "(Sin tema)"}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Subtema</div>
              {isLoadingSubtopic ? (
                <p className="mt-1 text-sm text-muted-foreground">Cargando subtema...</p>
              ) : (
                <p className="mt-1 whitespace-pre-wrap">{subtopic?.name || "(Sin subtema)"}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Creado por</div>
              {isLoadingTeacher ? (
                <p className="mt-1 text-sm text-muted-foreground">Cargando creador...</p>
              ) : (
                <p className="mt-1 whitespace-pre-wrap">{teacher?.user?.name || "(Sin creador)"}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link href="/dashboard/teacher/question">
              <Button variant="outline">Volver</Button>
            </Link>
            <Link href={`/dashboard/teacher/question/${question.id}/edit`}>
              <Button>Editar</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}