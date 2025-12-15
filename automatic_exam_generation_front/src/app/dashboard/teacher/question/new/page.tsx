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
  const [type, setType] = useState<"" | "VoF" | "Opción Múltiple" | "Argumentación">("")
  const [score, setScore] = useState<string>("")
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

        // set teacher from current user (if available)
        // getCurrentUser shape can vary; prefer teacher_id if present, fallback to id
        const tid = (currentUser?.teacherId ?? currentUser?.id ?? currentUser?.user?.id) ?? null
        setTeacherId(tid)

        // best-effort name from currentUser first
        const tentativeName =
          currentUser?.user?.name ?? currentUser?.name ?? currentUser?.user?.account ?? (tid ? String(tid) : null)
        if (tid) {
          // try to fetch full teacher data to get proper name
          try {
            const teacher = await getTeacherByID(String(tid))
            if (!mounted) return
            const tname = teacher?.user?.name ?? teacher?.user?.account ?? tentativeName ?? String(tid)
            setCreatorName(tname)
          } catch (err) {
            // fallback to tentative name or id
            if (!mounted) return
            setCreatorName(tentativeName ?? (tid ? String(tid) : null))
            console.error("Error fetching teacher details:", err)
          }
        } else {
          setCreatorName(tentativeName ?? null)
        }
      } catch (err) {
        console.error("Inicializando creador y listas:", err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  // when subject selected -> fetch topics for that subject
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

  // filtered lists (client-side while typing)
  const filteredSubjects = allSubjects.filter((s) =>
    (s.name || "").toLowerCase().includes(subjectQuery.trim().toLowerCase())
  )
  const filteredTopics = allTopics.filter((t) =>
    (t.name || "").toLowerCase().includes(topicQuery.trim().toLowerCase())
  )
  const filteredSubtopics = allSubtopics
    .filter((s) => String(s.topic_id) === String(topicId))
    .filter((s) => (s.name || "").toLowerCase().includes(subtopicQuery.trim().toLowerCase()))

  const selectSubject = (s: Option) => {
    setSubjectId(s.id as any)
    setSubjectQuery(s.name || "")
  }
  const selectTopic = (t: Option) => {
    setTopicId(t.id as any)
    setTopicQuery(t.name || "")
  }
  const selectSubtopic = (s: Option) => {
    setSubtopicId(s.id as any)
    setSubtopicQuery(s.name || "")
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        question_text: text,
        difficulty: difficulty || null,
        answer: answer || null,
        type: type || null,
        score: score === "" ? null : Number(score),
        subject_id: subjectId || null,
        topic_id: topicId || null,
        sub_topic_id: subtopicId || null,
        teacher_id: teacherId || null,
      }
      await postQuestion(payload)
      router.push("/dashboard/teacher/question")
    } catch (err) {
      console.error("Error creando pregunta:", err)
      alert("Error al crear la pregunta. Revisa la consola.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div>Cargando formulario...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl">
        <form className="space-y-6 rounded-xl border bg-card p-6 shadow-sm" onSubmit={onSubmit}>
          <h2 className="font-semibold text-xl">Crear pregunta</h2>

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
            <label className="text-sm text-muted-foreground">Puntaje</label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              placeholder="(opcional)"
              min="0"
              step="1"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Respuesta</label>
            <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-full mt-1 p-2 border rounded" rows={3} />
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
                    <li key={s.id} className={`p-2 cursor-pointer ${String(subjectId) === String(s.id) ? "bg-slate-100" : ""}`} onClick={() => selectSubject(s)}>
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
                    <li key={t.id} className={`p-2 cursor-pointer ${String(topicId) === String(t.id) ? "bg-slate-100" : ""}`} onClick={() => selectTopic(t)}>
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
                    <li key={s.id} className={`p-2 cursor-pointer ${String(subtopicId) === String(s.id) ? "bg-slate-100" : ""}`} onClick={() => selectSubtopic(s)}>
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
            <div className="mt-1">{creatorName ?? (teacherId ? String(teacherId) : "(Sin creador)")}</div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>{saving ? "Creando..." : "Crear"}</Button>
            <Link href="/dashboard/teacher/question"><Button variant="outline">Cancelar</Button></Link>
          </div>
        </form>
      </div>
    </main>
  )
}