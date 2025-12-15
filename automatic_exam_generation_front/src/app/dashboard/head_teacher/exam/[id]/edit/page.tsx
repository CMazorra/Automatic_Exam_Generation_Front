"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { getExamById, updateExam } from "@/services/examService"
import { getSubjects } from "@/services/subjectService"
import { getParams } from "@/services/paramsService"
import { getQuestions, getQuestionById } from "@/services/questionService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { toast } from "sonner"

interface SubjectOption {
  id: number | string
  name?: string
}

interface ParamsOption {
  id: number | string
  proportion?: string
  quest_topics?: string
  amount_quest?: string
}

export default function ExamEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)

  // loading / saving
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // exam
  const [exam, setExam] = useState<any | null>(null)

  // editable fields
  const [name, setName] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [subjectId, setSubjectId] = useState<number | string | "">("")
  const [paramsId, setParamsId] = useState<number | string | "">("")

  // lists + queries
  const [allSubjects, setAllSubjects] = useState<SubjectOption[]>([])
  const [subjectQuery, setSubjectQuery] = useState("")
  const [loadingSubjects, setLoadingSubjects] = useState(false)

  const [allParams, setAllParams] = useState<ParamsOption[]>([])
  const [paramsQuery, setParamsQuery] = useState("")
  const [loadingParams, setLoadingParams] = useState(false)

  // preguntas
  const [selectedQuestions, setSelectedQuestions] = useState<{ id: number; text: string }[]>([])
  const [allQuestions, setAllQuestions] = useState<any[]>([])
  const [questionSearch, setQuestionSearch] = useState("")
  const [loadingQuestions, setLoadingQuestions] = useState(false)

  const filteredSubjects = allSubjects.filter((s) =>
    (s.name || "").toLowerCase().includes(subjectQuery.trim().toLowerCase())
  )

  const filteredParams = allParams.filter((p) => {
    const label = [p.proportion, p.quest_topics, p.amount_quest].filter(Boolean).join(" ")
    return label.toLowerCase().includes(paramsQuery.trim().toLowerCase())
  })

  const filteredQuestionSuggestions = allQuestions.filter((q) => {
    const haystack = [
      q.question_text,
      q.subject_name,
      q.topic_name,
      q.sub_topic_name,
      q.type,
      q.difficulty,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
    return haystack.includes(questionSearch.toLowerCase())
  })

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setLoading(true)
        setLoadingSubjects(true)
        setLoadingParams(true)
        setLoadingQuestions(true)

        const [subjectsList, paramsList, examData, questionsList] = await Promise.all([
          getSubjects().catch((e) => {
            console.error(e)
            toast.error("Error de carga", { description: "No se pudieron cargar las asignaturas" })
            return []
          }),
          getParams().catch((e) => {
            console.error(e)
            toast.error("Error de carga", { description: "No se pudieron cargar las parametrizaciones" })
            return []
          }),
          getExamById(id).catch(() => null),
          getQuestions().catch((e) => {
            console.error(e)
            toast.error("Error de carga", { description: "No se pudo cargar el banco de preguntas" })
            return []
          }),
        ])

        if (!mounted) return

        setAllSubjects(Array.isArray(subjectsList) ? subjectsList : [])
        setAllParams(Array.isArray(paramsList) ? paramsList : [])

        const normalizedQuestions = Array.isArray(questionsList)
          ? questionsList.map((q: any) => ({
              ...q,
              question_text: q.question_text ?? q.text ?? q.statement ?? "",
            }))
          : []

        setAllQuestions(normalizedQuestions)

        if (!examData) {
          const msg = "No se encontró el examen."
          setError(msg)
          toast.error("Error", { description: msg })
          return
        }

        setExam(examData)
        setName(examData.name ?? "")
        setDifficulty(examData.difficulty ?? "")
        setSubjectId(examData.subject_id ?? "")
        setParamsId(examData.parameters_id ?? "")

        const selSubj = subjectsList.find((s: any) => String(s.id) === String(examData.subject_id))
        if (selSubj) setSubjectQuery(selSubj.name || "")

        const selParams = paramsList.find((p: any) => String(p.id) === String(examData.parameters_id))
        if (selParams) {
          const label = [selParams.proportion, selParams.quest_topics, selParams.amount_quest]
            .filter(Boolean)
            .join(" / ")
          setParamsQuery(label)
        }

        if (examData.exam_questions && Array.isArray(examData.exam_questions)) {
          const questionPromises = examData.exam_questions.map((eq: any) =>
            getQuestionById(eq.question_id || eq.id).catch(() => null)
          )

          const questionsData = await Promise.all(questionPromises)
          const validQuestions = questionsData
            .filter(Boolean)
            .map((q: any) => ({
              id: q.id,
              text: q.question_text || q.text || q.statement || "Sin texto",
            }))

          if (mounted) setSelectedQuestions(validQuestions)
        }
      } catch (e: any) {
        console.error(e)
        setError("Error cargando datos")
        toast.error("Error", { description: e?.message || "Error cargando datos" })
      } finally {
        if (mounted) {
          setLoading(false)
          setLoadingSubjects(false)
          setLoadingParams(false)
          setLoadingQuestions(false)
        }
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [id])

  const onSelectSubject = (s: SubjectOption) => {
    setSubjectId(s.id)
    setSubjectQuery(s.name || "")
  }

  const onSelectParams = (p: ParamsOption) => {
    setParamsId(p.id)
    const label = [p.proportion, p.quest_topics, p.amount_quest].filter(Boolean).join(" / ")
    setParamsQuery(label)
  }

  const addQuestionToExam = (q: any) => {
    if (!q?.id || selectedQuestions.some((sq) => sq.id === q.id)) return
    setSelectedQuestions((prev) => [...prev, { id: q.id, text: q.question_text }])
  }

  const removeQuestion = (idx: number) => {
    setSelectedQuestions((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        name: name.trim(),
        difficulty,
        subject_id: subjectId,
        parameters_id: paramsId,
        questions: selectedQuestions.map((q) => q.id),
      }

      await updateExam(id, payload)

      toast.success("Examen actualizado", {
        description: `El examen "${name}" se guardó correctamente`,
      })

      router.push(`/dashboard/head_teacher/exam/${id}`)
    } catch (e: any) {
      console.error(e)
      toast.error("Error al guardar", {
        description: e?.message || "Error al guardar examen",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center">Cargando editor…</main>
  }

  if (error) {
    return <main className="flex min-h-screen items-center justify-center text-destructive">{error}</main>
  }

  return (
    <main className="min-h-screen bg-background p-6">
      {/* JSX SIN CAMBIOS */}
    </main>
  )
}
