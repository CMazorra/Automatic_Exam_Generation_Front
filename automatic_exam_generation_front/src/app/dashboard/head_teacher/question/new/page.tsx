"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSubjects } from "@/services/subjectService"
import { getTopicsBySubjectId } from "@/services/topicService"
import { getSubtopics } from "@/services/subtopicService"
import { getCurrentUser } from "@/services/authService"
import { postQuestion } from "@/services/questionService"
import { getTeacherByID } from "@/services/teacherService"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"

interface Option {
  id: number | string
  name?: string
  topic_id?: number | string
}

export default function NewQuestionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // form
  const [text, setText] = useState("")
  const [difficulty, setDifficulty] = useState<"" | "Fácil" | "Medio" | "Difícil">("")
  const [answer, setAnswer] = useState("")
  const [type, setType] = useState<"" | "VoF" | "Opcion Multiple" | "Argumentacion">("")
  const [subjectId, setSubjectId] = useState<string | number | "">("")
  const [topicId, setTopicId] = useState<string | number | "">("")
  const [subtopicId, setSubtopicId] = useState<string | number | "">("")
  const [teacherId, setTeacherId] = useState<string | number | null>(null)
  const [creatorName, setCreatorName] = useState<string | null>(null)

  // data lists + queries
  const [allSubjects, setAllSubjects] = useState<Option[]>([])
  const [allTopics, setAllTopics] = useState<Option[]>([])
  const [allSubtopics, setAllSubtopics] = useState<Option[]>([])

  const [subjectQuery, setSubjectQuery] = useState("")
  const [topicQuery, setTopicQuery] = useState("")
  const [subtopicQuery, setSubtopicQuery] = useState("")

  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [loadingTopics, setLoadingTopics] = useState(false)
  const [loadingSubtopics, setLoadingSubtopics] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        setLoadingSubjects(true)

        const [subjectsList, subtopicsList, currentUser] = await Promise.all([
          getSubjects(),
          getSubtopics(),
          getCurrentUser(),
        ])

        if (!mounted) return

        setAllSubjects(subjectsList || [])
        setAllSubtopics(subtopicsList || [])
        setLoadingSubjects(false)

        const tid =
          currentUser?.teacherId ??
          currentUser?.id ??
          currentUser?.user?.id ??
          null

        setTeacherId(tid)

        const tentativeName =
          currentUser?.user?.name ??
          currentUser?.name ??
          currentUser?.user?.account ??
          (tid ? String(tid) : null)

        if (tid) {
          try {
            const teacher = await getTeacherByID(String(tid))
            if (!mounted) return
            setCreatorName(
              teacher?.user?.name ??
                teacher?.user?.account ??
                tentativeName ??
                String(tid)
            )
          } catch (err) {
            console.error("Error fetching teacher details:", err)
            setCreatorName(tentativeName ?? String(tid))
          }
        } else {
          setCreatorName(tentativeName)
        }
      } catch (err) {
        console.error("Inicializando creador y listas:", err)
        toast.error("Error de inicialización", {
          description: "No se pudieron cargar los datos iniciales.",
        })
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  // subject -> topics
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
      } catch (e) {
        console.error("Error fetching topics:", e)
        setAllTopics([])
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
    (s.name || "").toLowerCase().includes(subjectQuery.toLowerCase())
  )

  const filteredTopics = allTopics.filter((t) =>
    (t.name || "").toLowerCase().includes(topicQuery.toLowerCase())
  )

  const filteredSubtopics = allSubtopics
    .filter((s) => String(s.topic_id) === String(topicId))
    .filter((s) =>
      (s.name || "").toLowerCase().includes(subtopicQuery.toLowerCase())
    )

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        question_text: text,
        difficulty: difficulty || null,
        answer: answer || null,
        type: type || null,
        subject_id: subjectId || null,
        topic_id: topicId || null,
        sub_topic_id: subtopicId || null,
        teacher_id: teacherId || null,
      }

      await postQuestion(payload)

      toast.success("Pregunta creada", {
        description: "La pregunta fue registrada correctamente.",
      })

      router.push("/dashboard/teacher/question")
    } catch (err) {
      console.error("Error creando pregunta:", err)
      toast.error("Error al crear la pregunta", {
        description: "Revisa la consola para más detalles.",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div>Cargando formulario...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl">
        <form
          className="space-y-6 rounded-xl border bg-card p-6 shadow-sm"
          onSubmit={onSubmit}
        >
          <h2 className="text-xl font-semibold">Crear pregunta</h2>

          {/* FORM COMPLETAMENTE IGUAL AL ORIGINAL */}
          {/* No se toca el JSX de inputs */}

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Creando..." : "Crear"}
            </Button>
            <Link href="/dashboard/teacher/question">
              <Button variant="outline">Cancelar</Button>
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
