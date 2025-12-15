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

  // lists + queries for searchable selects
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

  // filtered (client-side)
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

        // load lists in parallel
        const [subjectsList, paramsList, examData, questionsList] = await Promise.all([
          getSubjects().catch(() => []),
          getParams().catch(() => []),
          getExamById(id).catch(() => null),
          getQuestions().catch(() => []),
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
          setError("No se encontró el examen.")
          setLoading(false)
          return
        }

        setExam(examData)

        // prefill editable fields
        setName(examData.name ?? "")
        setDifficulty(examData.difficulty ?? "")
        setSubjectId(examData.subject_id ?? "")
        setParamsId(examData.parameters_id ?? "")

        // prefill subject query with name if available
        const selSubj = (subjectsList || []).find((s: any) => String(s.id) === String(examData.subject_id))
        if (selSubj) setSubjectQuery(selSubj.name || "")

        // prefill params query label if available
        const selParams = (paramsList || []).find((p: any) => String(p.id) === String(examData.parameters_id))
        if (selParams) {
          const label = [selParams.proportion, selParams.quest_topics, selParams.amount_quest].filter(Boolean).join(" / ")
          setParamsQuery(label)
        }

        // Cargar preguntas desde exam_questions
        if (examData?.exam_questions && Array.isArray(examData.exam_questions)) {
          try {
            const questionPromises = examData.exam_questions.map((eq: any) => {
              const questionId = eq.question_id || eq.id
              return getQuestionById(questionId).catch(err => {
                console.error(`Error fetching question ${questionId}:`, err)
                return null
              })
            })
            const questionsData = await Promise.all(questionPromises)
            const validQuestions = questionsData
              .filter(q => q !== null)
              .map(q => ({
                id: q.id,
                text: q.question_text || q.text || q.statement || "Sin texto"
              }))
            if (mounted) setSelectedQuestions(validQuestions)
          } catch (e) {
            console.error('Error fetching questions', e)
          }
        }
      } catch (e: any) {
        console.error("Error cargando editor de examen:", e)
        if (mounted) setError(e?.message || "Error cargando datos")
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
    setSubjectId(s.id as any)
    setSubjectQuery(s.name || "")
  }

  const onSelectParams = (p: ParamsOption) => {
    setParamsId(p.id as any)
    const label = [p.proportion, p.quest_topics, p.amount_quest].filter(Boolean).join(" / ")
    setParamsQuery(label)
  }

  const addQuestionToExam = (q: any) => {
    const text = (q.question_text || "").trim()
    const qId = q.id
    if (!text || !qId) return
    // Evitar duplicados
    if (selectedQuestions.some(sq => sq.id === qId)) return
    setSelectedQuestions(prev => [...prev, { id: qId, text }])
  }

  const removeQuestion = (idx: number) => {
    setSelectedQuestions(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      // payload with only editable fields
      const payload: Record<string, any> = {
        name: name?.trim() || null,
        difficulty: difficulty || null,
        subject_id: subjectId || null,
        parameters_id: paramsId || null,
        questions: selectedQuestions.map(q => q.id),
      }

      await updateExam(id, payload)
      router.push(`/dashboard/head_teacher/exam/${id}`)
    } catch (e: any) {
      console.error("Error actualizando examen:", e)
      alert(e?.message || "Error al guardar examen")
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

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-destructive">{error}</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl">
        <form className="space-y-6 rounded-xl border bg-card p-6 shadow-sm" onSubmit={handleSubmit}>
          <h2 className="font-semibold text-xl">Editar Examen</h2>

          {/* Name */}
          <div>
            <label className="text-sm text-muted-foreground">Nombre</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del examen" required />
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-sm text-muted-foreground">Dificultad</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              required
            >
              <option value="">(Sin seleccionar)</option>
              <option value="facil">Fácil</option>
              <option value="medio">Medio</option>
              <option value="dificil">Difícil</option>
            </select>
          </div>

          {/* Subject (searchable) */}
          <div>
            <label className="text-sm text-muted-foreground">Asignatura (buscar)</label>
            <input
              value={subjectQuery}
              onChange={(e) => setSubjectQuery(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              placeholder="Escribe para buscar asignaturas..."
            />
            <div className="mt-2">
              {loadingSubjects ? (
                <div className="text-sm text-muted-foreground">Cargando asignaturas...</div>
              ) : (
                <ul className="border rounded max-h-40 overflow-auto">
                  {filteredSubjects.map((s) => (
                    <li
                      key={s.id}
                      className={`p-2 cursor-pointer ${String(subjectId) === String(s.id) ? "bg-slate-100" : ""}`}
                      onClick={() => onSelectSubject(s)}
                    >
                      {s.name}
                    </li>
                  ))}
                </ul>
              )}
              <div className="text-xs text-muted-foreground mt-1">Asignatura seleccionada: {subjectId || "(ninguna)"}</div>
            </div>
          </div>

          {/* Parameters (searchable) */}
          <div>
            <label className="text-sm text-muted-foreground">Parametrización (buscar)</label>
            <input
              value={paramsQuery}
              onChange={(e) => setParamsQuery(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              placeholder="Escribe para buscar parametrizaciones..."
            />
            <div className="mt-2">
              {loadingParams ? (
                <div className="text-sm text-muted-foreground">Cargando parametrizaciones...</div>
              ) : (
                <ul className="border rounded max-h-40 overflow-auto">
                  {filteredParams.map((p) => (
                    <li
                      key={p.id}
                      className={`p-2 cursor-pointer ${String(paramsId) === String(p.id) ? "bg-slate-100" : ""}`}
                      onClick={() => onSelectParams(p)}
                    >
                      {[p.proportion, p.quest_topics, p.amount_quest].filter(Boolean).join(" — ")}
                    </li>
                  ))}
                </ul>
              )}
              <div className="text-xs text-muted-foreground mt-1">Parametrización seleccionada: {paramsId || "(ninguna)"}</div>
            </div>
          </div>

          {/* Sección de preguntas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preguntas del examen</h3>

            {/* Banco de preguntas con filtro en vivo */}
            <div>
              <label className="text-sm text-muted-foreground">Buscar en banco de preguntas</label>
              <input
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
                placeholder="Filtra por texto, asignatura, tema, subtema, tipo o dificultad..."
              />
              <div className="mt-2">
                {loadingQuestions ? (
                  <div className="text-sm text-muted-foreground">Cargando preguntas...</div>
                ) : (
                  <ul className="border rounded max-h-48 overflow-auto">
                    {filteredQuestionSuggestions.map((q) => (
                      <li 
                        key={q.id} 
                        className="p-2 hover:bg-slate-100 cursor-pointer" 
                        onClick={() => addQuestionToExam(q)}
                      >
                        <div className="text-sm font-medium">{q.question_text}</div>
                        <div className="text-xs text-muted-foreground">
                          {[q.subject_name, q.topic_name, q.sub_topic_name].filter(Boolean).join(" • ")}{" "}
                          {q.type ? ` • ${q.type}` : ""} {q.difficulty ? ` • ${q.difficulty}` : ""}
                        </div>
                      </li>
                    ))}
                    {filteredQuestionSuggestions.length === 0 && (
                      <li className="p-2 text-sm text-muted-foreground">No hay preguntas que coincidan.</li>
                    )}
                  </ul>
                )}
              </div>
            </div>

            {/* Lista de preguntas seleccionadas */}
            <div>
              <label className="text-sm text-muted-foreground">Preguntas añadidas ({selectedQuestions.length})</label>
              <ul className="border rounded p-2 space-y-2 mt-2">
                {selectedQuestions.length === 0 && (
                  <li className="text-sm text-muted-foreground">No hay preguntas añadidas.</li>
                )}
                {selectedQuestions.map((q, idx) => (
                  <li key={q.id} className="flex justify-between items-center border-b pb-2 last:border-b-0">
                    <span className="text-sm">{idx + 1}. {q.text}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(idx)}>
                      Quitar
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link href={`/dashboard/head_teacher/exam/${id}`}>
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>

            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
