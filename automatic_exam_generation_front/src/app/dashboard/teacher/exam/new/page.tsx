"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createExam } from "@/services/examService"
import { getSubjects } from "@/services/subjectService"
import { getParams } from "@/services/paramsService"
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

export default function ExamCreatePage() {
  const router = useRouter()

  // form fields
  const [name, setName] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [subjectId, setSubjectId] = useState<number | string | "">("")
  const [paramsId, setParamsId] = useState<number | string | "">("")
  const [teacherId, setTeacherId] = useState<number | string>("") // temporal, manual

  // lists + search
  const [allSubjects, setAllSubjects] = useState<SubjectOption[]>([])
  const [subjectQuery, setSubjectQuery] = useState("")
  const [loadingSubjects, setLoadingSubjects] = useState(false)

  const [allParams, setAllParams] = useState<ParamsOption[]>([])
  const [paramsQuery, setParamsQuery] = useState("")
  const [loadingParams, setLoadingParams] = useState(false)

  const filteredSubjects = allSubjects.filter((s) =>
    (s.name || "").toLowerCase().includes(subjectQuery.toLowerCase())
  )

  const filteredParams = allParams.filter((p) => {
    const label = [p.proportion, p.quest_topics, p.amount_quest]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
    return label.includes(paramsQuery.toLowerCase())
  })

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setLoadingSubjects(true)
        setLoadingParams(true)

        const [subjectsList, paramsList] = await Promise.all([
          getSubjects().catch(() => []),
          getParams().catch(() => []),
        ])

        if (!mounted) return

        setAllSubjects(Array.isArray(subjectsList) ? subjectsList : [])
        setAllParams(Array.isArray(paramsList) ? paramsList : [])
      } catch (err) {
        console.error("Error cargando listas:", err)
      } finally {
        if (mounted) {
          setLoadingSubjects(false)
          setLoadingParams(false)
        }
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  const onSelectSubject = (s: SubjectOption) => {
    setSubjectId(s.id)
    setSubjectQuery(s.name || "")
  }

  const onSelectParams = (p: ParamsOption) => {
    setParamsId(p.id)
    const label = [p.proportion, p.quest_topics, p.amount_quest].filter(Boolean).join(" / ")
    setParamsQuery(label)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!teacherId) {
      alert("Debes ingresar manualmente el teacher_id por ahora.")
      return
    }

    try {
      const payload = {
        name: name.trim(),
        difficulty: difficulty || null,
        subject_id: subjectId || null,
        parameters_id: paramsId || null,
        teacher_id: Number(teacherId),
        head_teacher_id: null,
        status: "borrador",
      }

      await createExam(payload)
      router.push("/dashboard/teacher/exam")
    } catch (err: any) {
      console.error("Error creando examen:", err)
      alert(err?.message || "Error al crear examen.")
    }
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl">
        <form
          className="space-y-6 rounded-xl border bg-card p-6 shadow-sm"
          onSubmit={handleSubmit}
        >
          <h2 className="font-semibold text-xl">Crear nuevo examen</h2>

          {/* NAME */}
          <div>
            <label className="text-sm text-muted-foreground">Nombre</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del examen"
              required
            />
          </div>

          {/* DIFFICULTY */}
          <div>
            <label className="text-sm text-muted-foreground">Dificultad</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              required
            >
              <option value="">(Seleccione una dificultad)</option>
              <option value="facil">Fácil</option>
              <option value="medio">Medio</option>
              <option value="dificil">Difícil</option>
            </select>
          </div>

          {/* SUBJECT SEARCH */}
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
                <div className="text-sm text-muted-foreground">Cargando...</div>
              ) : (
                <ul className="border rounded max-h-40 overflow-auto">
                  {filteredSubjects.map((s) => (
                    <li
                      key={s.id}
                      className={`p-2 cursor-pointer ${
                        String(subjectId) === String(s.id) ? "bg-slate-100" : ""
                      }`}
                      onClick={() => onSelectSubject(s)}
                    >
                      {s.name}
                    </li>
                  ))}
                </ul>
              )}

              <div className="text-xs text-muted-foreground mt-1">
                Asignatura seleccionada: {subjectId || "(ninguna)"}
              </div>
            </div>
          </div>

          {/* PARAMS SEARCH */}
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
                <div className="text-sm text-muted-foreground">Cargando...</div>
              ) : (
                <ul className="border rounded max-h-40 overflow-auto">
                  {filteredParams.map((p) => (
                    <li
                      key={p.id}
                      className={`p-2 cursor-pointer ${
                        String(paramsId) === String(p.id) ? "bg-slate-100" : ""
                      }`}
                      onClick={() => onSelectParams(p)}
                    >
                      {[p.proportion, p.quest_topics, p.amount_quest]
                        .filter(Boolean)
                        .join(" — ")}
                    </li>
                  ))}
                </ul>
              )}

              <div className="text-xs text-muted-foreground mt-1">
                Parametrización seleccionada: {paramsId || "(ninguna)"}
              </div>
            </div>
          </div>

          {/* TEACHER ID (manual por ahora) */}
          <div>
            <label className="text-sm text-muted-foreground">
              Profesor (teacher_id) — temporal, manual
            </label>
            <Input
              type="number"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              placeholder="Ingresa tu ID de profesor"
              required
            />
          </div>

          {/* READONLY */}
          <div>
            <label className="text-sm text-muted-foreground">Estado</label>
            <div className="mt-1">borrador</div>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3">
            <Link href="/dashboard/teacher/exam">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>

            <Button type="submit">Crear examen</Button>
          </div>
        </form>
      </div>
    </main>
  )
}
