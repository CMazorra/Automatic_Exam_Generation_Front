"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { getQuestionById, updateQuestion } from "@/services/questionService"
import { getSubjects } from "@/services/subjectService"
import { getTopicsBySubjectId } from "@/services/topicService"
import { getSubtopics } from "@/services/subtopicService"
import { getTeacherByID } from "@/services/teacherService"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Link from "next/link"

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
  score?: number
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
  const [score, setScore] = useState<number | "">("")

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

  // helpers: normalize values from backend to our option values
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

        // load question
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
        setScore(typeof q.score === "number" ? q.score : "")

        // pre-fill query inputs with names if available from lists
        const selSubj = (subjectsList || []).find((s: any) => String(s.id) === String(q.subject_id))
        if (selSubj) setSubjectQuery(selSubj.name || "")

        // fetch topics for subject if present
        if (q.subject_id) {
          setLoadingTopics(true)
          try {
            const topicsForSubj = await getTopicsBySubjectId(String(q.subject_id))
            if (!mounted) return
            setAllTopics(topicsForSubj || [])
            const selTopic = (topicsForSubj || []).find((t: any) => String(t.id) === String(q.topic_id))
            if (selTopic) setTopicQuery(selTopic.name || "")
          } catch (err) {
            console.error("Error fetching topics inicial:", err)
            setAllTopics([])
          } finally {
            if (mounted) setLoadingTopics(false)
          }
        }

        // pre-fill subtopic name if possible from allSubtopics
        const selSub = (subtopicsList || []).find((s: any) => String(s.id) === String(q.sub_topic_id))
        if (selSub) setSubtopicQuery(selSub.name || "")

        // fetch teacher name (creator) if exists
        if (q.teacher_id) {
          try {
            const t = await getTeacherByID(String(q.teacher_id))
            if (!mounted) return
            const name = t?.user?.name || t?.user?.account || String(q.teacher_id)
            setCreatorName(name)
          } catch (err) {
            console.error("Error fetching teacher name:", err)
            setCreatorName(String(q.teacher_id))
          }
        } else {
          setCreatorName(null)
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

  // when subject changes: clear dependent selections and fetch topics for that subject
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
        console.error("Error fetching topics for subject:", e)
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

  // filtered lists shown while typing
  const filteredSubjects = allSubjects.filter((s) =>
    (s.name || "").toLowerCase().includes(subjectQuery.trim().toLowerCase())
  )
  const filteredTopics = allTopics.filter((t) =>
    (t.name || "").toLowerCase().includes(topicQuery.trim().toLowerCase())
  )
  const filteredSubtopics = allSubtopics
    .filter((s) => String(s.topic_id) === String(topicId)) // only subtopics of selected topic
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
      const payload = {
        question_text: text,
        difficulty: difficulty || null,
        answer,
        type: type || null,
        subject_id: subjectId || null,
        topic_id: topicId || null,
        sub_topic_id: subtopicId || null,
        score: typeof score === "number" ? score : null,
      }
      await updateQuestion(String(question.id), payload)
      toast.success("Pregunta actualizada", {
        description: "La pregunta ha sido guardada exitosamente.",
      })
      router.push("/dashboard/head_teacher/question")
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
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl">
        <form className="space-y-6 rounded-xl border bg-card p-6 shadow-sm" onSubmit={onSubmit}>
          <h2 className="font-semibold text-xl">Editar pregunta</h2>

          <div>
            <label className="text-sm text-muted-foreground">Texto</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Dificultad</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} className="w-full mt-1 p-2 border rounded">
                <option value="">(Sin seleccionar)</option>
                <option value="Fácil">Fácil</option>
                <option value="Medio">Medio</option>
                <option value="Difícil">Difícil</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Tipo</label>
              <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full mt-1 p-2 border rounded">
                <option value="">(Sin seleccionar)</option>
                <option value="VoF">VoF</option>
                <option value="Opcion Multiple">Opcion Multiple</option>
                <option value="Argumentacion">Argumentacion</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Respuesta</label>
            <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-full mt-1 p-2 border rounded" rows={3} />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Puntaje</label>
            <input
              type="number"
              value={score}
              onChange={(e) => {
                const v = e.target.value
                setScore(v === "" ? "" : Number(v))
              }}
              className="w-full mt-1 p-2 border rounded"
              placeholder="Ej: 5"
              min={0}
              step={1}
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Asignatura (buscar)</label>
            <input
              value={subjectQuery}
              onChange={(e) => setSubjectQuery(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              placeholder="Escribe para buscar..."
            />
            <div className="mt-2">
              {loadingSubjects ? <div className="text-sm text-muted-foreground">Cargando...</div> : (
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

          <div>
            <label className="text-sm text-muted-foreground">Tema (filtrado por asignatura)</label>
            <input
              value={topicQuery}
              onChange={(e) => setTopicQuery(e.target.value)}
              disabled={!subjectId}
              className="w-full mt-1 p-2 border rounded"
              placeholder={!subjectId ? "Selecciona una asignatura primero" : "Escribe para buscar temas..."}
            />
            <div className="mt-2">
              {loadingTopics ? <div className="text-sm text-muted-foreground">Cargando...</div> : (
                <ul className="border rounded max-h-40 overflow-auto">
                  {filteredTopics.map((t) => (
                    <li key={t.id} className={`p-2 cursor-pointer ${String(topicId) === String(t.id) ? "bg-slate-100" : ""}`} onClick={() => onSelectTopic(t)}>
                      {t.name}
                    </li>
                  ))}
                </ul>
              )}
              <div className="text-xs text-muted-foreground mt-1">Tema seleccionado: {topicId || "(ninguno)"}</div>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Subtema (filtrado por tema)</label>
            <input
              value={subtopicQuery}
              onChange={(e) => setSubtopicQuery(e.target.value)}
              disabled={!topicId}
              className="w-full mt-1 p-2 border rounded"
              placeholder={!topicId ? "Selecciona un tema primero" : "Escribe para buscar subtemas..."}
            />
            <div className="mt-2">
              {loadingSubtopics ? <div className="text-sm text-muted-foreground">Cargando...</div> : (
                <ul className="border rounded max-h-40 overflow-auto">
                  {filteredSubtopics.map((s) => (
                    <li key={s.id} className={`p-2 cursor-pointer ${String(subtopicId) === String(s.id) ? "bg-slate-100" : ""}`} onClick={() => onSelectSubtopic(s)}>
                      {s.name}
                    </li>
                  ))}
                </ul>
              )}
              <div className="text-xs text-muted-foreground mt-1">Subtema seleccionado: {subtopicId || "(ninguno)"}</div>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Creador (no editable)</label>
            <div className="mt-1">{creatorName ?? (question?.teacher_id ? String(question.teacher_id) : "(Sin creador)")}</div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
            <Link href="/dashboard/head_teacher/question"><Button variant="outline">Cancelar</Button></Link>
          </div>
        </form>
      </div>
    </main>
  )
}