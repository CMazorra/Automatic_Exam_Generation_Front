"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getExamById, updateExam } from "@/services/examService"
import { getSubjects } from "@/services/subjectService"
import { getParams, getParamsById } from "@/services/paramsService"
import { getTeacherByID } from "@/services/teacherService"
import { getHeadTeacherByID } from "@/services/headTeacerService"
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

export default function ExamEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const id = params.id

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

  // readonly labels
  const [teacherLabel, setTeacherLabel] = useState<string | null>(null)
  const [headLabel, setHeadLabel] = useState<string | null>(null)

  // lists + queries for searchable selects
  const [allSubjects, setAllSubjects] = useState<SubjectOption[]>([])
  const [subjectQuery, setSubjectQuery] = useState("")
  const [loadingSubjects, setLoadingSubjects] = useState(false)

  const [allParams, setAllParams] = useState<ParamsOption[]>([])
  const [paramsQuery, setParamsQuery] = useState("")
  const [loadingParams, setLoadingParams] = useState(false)

  // filtered (client-side)
  const filteredSubjects = allSubjects.filter((s) =>
    (s.name || "").toLowerCase().includes(subjectQuery.trim().toLowerCase())
  )

  const filteredParams = allParams.filter((p) => {
    const label = [p.proportion, p.quest_topics, p.amount_quest].filter(Boolean).join(" ")
    return label.toLowerCase().includes(paramsQuery.trim().toLowerCase())
  })

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setLoading(true)
        setLoadingSubjects(true)
        setLoadingParams(true)

        // load lists in parallel
        const [subjectsList, paramsList, examData] = await Promise.all([
          getSubjects().catch(() => []),
          getParams().catch(() => []),
          getExamById(id).catch(() => null),
        ])

        if (!mounted) return

        setAllSubjects(Array.isArray(subjectsList) ? subjectsList : [])
        setAllParams(Array.isArray(paramsList) ? paramsList : [])

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

        // fetch teacher and head teacher labels (best effort)
        if (examData.teacher_id) {
          try {
            const t = await getTeacherByID(Number(examData.teacher_id))
            const tlabel = t?.user?.name ?? t?.name ?? String(examData.teacher_id)
            if (mounted) setTeacherLabel(tlabel)
          } catch (e) {
            if (mounted) setTeacherLabel(String(examData.teacher_id))
          }
        } else {
          setTeacherLabel(null)
        }

        if (examData.head_teacher_id) {
          try {
            const h = await getHeadTeacherByID(Number(examData.head_teacher_id))
            const hlabel = h?.user?.name ?? h?.name ?? String(examData.head_teacher_id)
            if (mounted) setHeadLabel(hlabel)
          } catch (e) {
            if (mounted) setHeadLabel(String(examData.head_teacher_id))
          }
        } else {
          setHeadLabel(null)
        }
      } catch (e: any) {
        console.error("Error cargando editor de examen:", e)
        if (mounted) setError(e?.message || "Error cargando datos")
      } finally {
        if (mounted) {
          setLoading(false)
          setLoadingSubjects(false)
          setLoadingParams(false)
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
      }

      await updateExam(id, payload)
      router.push(`/dashboard/teacher/exam/${id}`)
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

          {/* Read-only fields */}
          <div>
            <label className="text-sm text-muted-foreground">Estado (solo lectura)</label>
            <div className="mt-1">{exam?.status ?? "(sin estado)"}</div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Profesor (creador)</label>
            <div className="mt-1">{teacherLabel ?? String(exam?.teacher_id ?? "(desconocido)")}</div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Jefe de Asignatura (validador)</label>
            <div className="mt-1">{headLabel ?? String(exam?.head_teacher_id ?? "(ninguno)")}</div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link href={`/dashboard/teacher/exam/${id}`}>
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
