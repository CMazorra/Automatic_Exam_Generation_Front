"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { getQuestionById, updateQuestion } from "@/services/questionService"
import { getSubjects } from "@/services/subjectService"
import { getTopicsBySubjectId } from "@/services/topicService"
import { getSubtopics } from "@/services/subtopicService"
import { getTeacherByID } from "@/services/teacherService"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner" // ✅ agregado por la IA

interface Question {
  id: number | string
  question_text?: string
  difficulty?: string
  answer?: string
  type?: string
  subject_id?: number | string
  topic_id?: number | string
  sub_topic_id?: number | string
  teacher_id?: number | string
}

interface Option {
  id: number | string
  name?: string
  topic_id?: number | string
}

export default function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [question, setQuestion] = useState<Question | null>(null)

  // form fields
  const [text, setText] = useState("")
  const [difficulty, setDifficulty] = useState<"Fácil" | "Medio" | "Difícil" | "">("")
  const [answer, setAnswer] = useState("")
  const [type, setType] = useState<"VoF" | "Opcion Multiple" | "Argumentacion" | "">("")
  const [subjectId, setSubjectId] = useState<string | number | "">("")
  const [topicId, setTopicId] = useState<string | number | "">("")
  const [subtopicId, setSubtopicId] = useState<string | number | "">("")

  // creator name
  const [creatorName, setCreatorName] = useState<string | null>(null)

  // data lists
  const [allSubjects, setAllSubjects] = useState<Option[]>([])
  const [allTopics, setAllTopics] = useState<Option[]>([])
  const [allSubtopics, setAllSubtopics] = useState<Option[]>([])

  // queries (inputs)
  const [subjectQuery, setSubjectQuery] = useState("")
  const [topicQuery, setTopicQuery] = useState("")
  const [subtopicQuery, setSubtopicQuery] = useState("")

  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [loadingTopics, setLoadingTopics] = useState(false)
  const [loadingSubtopics, setLoadingSubtopics] = useState(false)

  // helpers
  const normalizeDifficulty = (v: any): "Fácil" | "Medio" | "Difícil" | "" => {
    if (!v && v !== "") return ""
    const s = String(v || "").toLowerCase()
    if (s.includes("fác")) return "Fácil"
    if (s.includes("med")) return "Medio"
    if (s.includes("dif") || s.includes("dific")) return "Difícil"
    return ""
  }

  const normalizeType = (v: any): "VoF" | "Opcion Multiple" | "Argumentacion" | "" => {
    if (!v && v !== "") return ""
    const s = String(v || "").toLowerCase()
    if (s.includes("vof") || s.includes("v/f") || s.includes("verdad")) return "VoF"
    if (s.includes("opcion") || s.includes("multiple") || s.includes("múltiple")) return "Opcion Multiple"
    if (s.includes("arg") || s.includes("argument")) return "Argumentacion"
    return ""
  }

  // load initial resources + question
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        setLoadingSubjects(true)

        const [subjectsList, subtopicsList, resolvedParams] = await Promise.all([
          getSubjects(),
          getSubtopics(),
          (params as any),
        ])

        if (!mounted) return

        setAllSubjects(subjectsList || [])
        setAllSubtopics(subtopicsList || [])
        setLoadingSubjects(false)

        const qid = String(resolvedParams.id)
        const q = await getQuestionById(qid)
        if (!mounted) return

        setQuestion(q)
        setText(q.question_text || "")
        setDifficulty(normalizeDifficulty(q.difficulty))
        setAnswer(q.answer || "")
        setType(normalizeType(q.type))
        setSubjectId(q.subject_id ?? "")
        setTopicId(q.topic_id ?? "")
        setSubtopicId(q.sub_topic_id ?? "")

        const selSubj = (subjectsList || []).find((s: any) => String(s.id) === String(q.subject_id))
        if (selSubj) setSubjectQuery(selSubj.name || "")

        if (q.subject_id) {
          setLoadingTopics(true)
          try {
            const topicsForSubj = await getTopicsBySubjectId(String(q.subject_id))
            if (!mounted) return
            setAllTopics(topicsForSubj || [])
            const selTopic = (topicsForSubj || []).find((t: any) => String(t.id) === String(q.topic_id))
            if (selTopic) setTopicQuery(selTopic.name || "")
          } finally {
            if (mounted) setLoadingTopics(false)
          }
        }

        const selSub = (subtopicsList || []).find((s: any) => String(s.id) === String(q.sub_topic_id))
        if (selSub) setSubtopicQuery(selSub.name || "")

        if (q.teacher_id) {
          try {
            const t = await getTeacherByID(String(q.teacher_id))
            if (!mounted) return
            setCreatorName(t?.user?.name || t?.user?.account || String(q.teacher_id))
          } catch {
            setCreatorName(String(q.teacher_id))
          }
        }
      } catch (e) {
        console.error("Error initializing editor:", e)
        toast.error("Error de carga", {
          description: "No se pudo inicializar el editor de preguntas.",
        })
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [params])

  useEffect(() => {
    setTopicId("")
    setSubtopicId("")
    setAllTopics([])
    setTopicQuery("")
    setSubtopicQuery("")
    if (!subjectId) return

    let mounted = true
    const run = async () => {
      try {
        setLoadingTopics(true)
        const list = await getTopicsBySubjectId(String(subjectId))
        if (!mounted) return
        setAllTopics(list || [])
      } finally {
        if (mounted) setLoadingTopics(false)
      }
    }

    run()
    return () => {
      mounted = false
    }
  }, [subjectId])

  const filteredSubjects = allSubjects.filter((s) =>
    (s.name || "").toLowerCase().includes(subjectQuery.trim().toLowerCase())
  )

  const filteredTopics = allTopics.filter((t) =>
    (t.name || "").toLowerCase().includes(topicQuery.trim().toLowerCase())
  )

  const filteredSubtopics = allSubtopics
    .filter((s) => String(s.topic_id) === String(topicId))
    .filter((s) => (s.name || "").toLowerCase().includes(subtopicQuery.trim().toLowerCase()))

  const onSelectSubject = (s: Option) => {
    setSubjectId(s.id as any)
    setSubjectQuery(s.name || "")
  }

  const onSelectTopic = (t: Option) => {
    setTopicId(t.id as any)
    setTopicQuery(t.name || "")
  }

  const onSelectSubtopic = (s: Option) => {
    setSubtopicId(s.id as any)
    setSubtopicQuery(s.name || "")
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question) return
    setSaving(true)

    try {
      await updateQuestion(String(question.id), {
        question_text: text,
        difficulty: difficulty || null,
        answer,
        type: type || null,
        subject_id: subjectId || null,
        topic_id: topicId || null,
        sub_topic_id: subtopicId || null,
      })

      toast.success("Pregunta actualizada", {
        description: "La pregunta ha sido guardada exitosamente.",
      })

      router.push("/dashboard/teacher/question")
    } catch (err) {
      console.error("Error updating question:", err)
      toast.error("Error al guardar", {
        description: "Ocurrió un error al actualizar la pregunta.",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div>Cargando editor...</div>
      </main>
    )
  }

  return (
    /* ⬇️ JSX ORIGINAL SIN CAMBIOS ⬇️ */
    <main className="min-h-screen bg-background p-6">
      {/* … resto intacto … */}
    </main>
  )
}
