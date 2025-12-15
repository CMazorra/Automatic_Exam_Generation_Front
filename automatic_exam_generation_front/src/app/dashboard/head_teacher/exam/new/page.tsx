"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createExam, generateExam } from "@/services/examService"
import { getSubjectsFlatByTeacherID } from "@/services/subjectService"
import { getParams } from "@/services/paramsService"
import { getQuestions } from "@/services/questionService"
import { getCurrentUser } from "@/services/authService"
import { getHeadTeachers } from "@/services/headTeacerService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"

interface SubjectOption {
  id: number | string
  name?: string
  head_teacher_id: number | string
}

interface ParamsOption {
  id: number | string
  proportion?: string
  quest_topics?: string
  amount_quest?: string
}

interface HeadTeacherOption {
  id: number | string
  name?: string
  user?: { name?: string }
  teacher?: { user?: { name?: string } }
}

export default function ExamCreatePage() {
  const router = useRouter()

  // form fields
  const [name, setName] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [subjectId, setSubjectId] = useState<number | string | "">("")
  const [paramsId, setParamsId] = useState<number | string | "">("")
  const [teacherId, setTeacherId] = useState<number | string>("") // obtenido automáticamente
  const [headTeacherId, setHeadTeacherId] = useState<number | string | "">("")
  const [isManual, setIsManual] = useState(false)

  // lists + search
  const [allSubjects, setAllSubjects] = useState<SubjectOption[]>([])
  const [subjectQuery, setSubjectQuery] = useState("")
  const [loadingSubjects, setLoadingSubjects] = useState(false)

  const [allParams, setAllParams] = useState<ParamsOption[]>([])
  const [paramsQuery, setParamsQuery] = useState("")
  const [loadingParams, setLoadingParams] = useState(false)

  const [allHeadTeachers, setAllHeadTeachers] = useState<HeadTeacherOption[]>([])
  const [headTeacherQuery, setHeadTeacherQuery] = useState("")
  const [loadingHeadTeachers, setLoadingHeadTeachers] = useState(false)

  // UI para preguntas manuales
  const [manualQuestions, setManualQuestions] = useState<{ id: number; text: string }[]>([])
  const [newQuestionText, setNewQuestionText] = useState("")
  const [questionSearch, setQuestionSearch] = useState("")
  const [allQuestions, setAllQuestions] = useState<any[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)

  const filteredSubjects = allSubjects.filter((s) =>
    (s.name || "").toLowerCase().includes(subjectQuery.toLowerCase())
  )

  const filteredParams = allParams.filter((p) => {
    const label = [p.proportion, p.quest_topics, p.amount_quest].filter(Boolean).join(" ").toLowerCase()
    return label.includes(paramsQuery.toLowerCase())
  })

  const filteredHeadTeachers = allHeadTeachers.filter((ht) => {
    const htName = ht.name || ht.user?.name || ht.teacher?.user?.name || ""
    return htName.toLowerCase().includes(headTeacherQuery.toLowerCase())
  })

  // Filtrar preguntas (sugerencias) mientras escribe el usuario
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

  // Obtener teacher_id del usuario actual
  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const user = await getCurrentUser()
        if (user?.id) {
          setTeacherId(user.id)
        } else {
          const raw = typeof window !== "undefined" ? localStorage.getItem("userId") : null
          if (raw) setTeacherId(Number(raw))
        }
      } catch (error) {
        console.error("Error obteniendo usuario actual:", error)
        const raw = typeof window !== "undefined" ? localStorage.getItem("userId") : null
        if (raw) setTeacherId(Number(raw))
      }
    }
    loadCurrentUser()
  }, [])


  useEffect(() => {
    let mounted = true
    if (!teacherId) return // Espera a tener el ID del profesor

    async function loadSubjects() {
      try {
        setLoadingSubjects(true)
        // Usa la función para obtener solo las asignaturas del profesor
        const subjectsList = await getSubjectsFlatByTeacherID(String(teacherId)).catch(() => [])
        if (mounted) {
          setAllSubjects(Array.isArray(subjectsList) ? subjectsList : [])
        }
      } catch (err) {
        console.error("Error cargando asignaturas del profesor:", err)
      } finally {
        if (mounted) {
          setLoadingSubjects(false)
        }
      }
    }

    loadSubjects()

    return () => {
      mounted = false
    }
  }, [teacherId]) // Se ejecuta cuando teacherId cambia o está disponible


  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        // Quitamos la carga de Subjects de este bloque
        setLoadingParams(true)
        setLoadingHeadTeachers(true)

        const [paramsList, headTeachersList] = await Promise.all([
          getParams().catch(() => []),
          getHeadTeachers().catch(() => []),
        ])

        if (!mounted) return

        // Quitamos setAllSubjects
        setAllParams(Array.isArray(paramsList) ? paramsList : [])
        setAllHeadTeachers(Array.isArray(headTeachersList) ? headTeachersList : [])
      } catch (err) {
        console.error("Error cargando listas:", err)
      } finally {
        if (mounted) {
          // Quitamos setLoadingSubjects(false)
          setLoadingParams(false)
          setLoadingHeadTeachers(false)
        }
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  // Cargar sugerencias del banco de preguntas para modo manual (una sola vez al activar manual)
  useEffect(() => {
    let mounted = true
    async function loadQuestions() {
      if (!isManual) return
      try {
        setLoadingQuestions(true)
        const qs = await getQuestions().catch(() => [])
        const list = Array.isArray(qs) ? qs : []
        // Normalizar campos que ayudan a filtrar por nombres si existen
        const normalized = list.map((q: any) => ({
          ...q,
          question_text: q.question_text ?? q.text ?? q.statement ?? "",
        }))
        if (mounted) setAllQuestions(normalized)
      } catch (e) {
        console.error("Error cargando preguntas:", e)
        if (mounted) setAllQuestions([])
      } finally {
        if (mounted) setLoadingQuestions(false)
      }
    }
    loadQuestions()
    return () => {
      mounted = false
    }
  }, [isManual])


  const onSelectSubject = async (s: SubjectOption) => {
    setSubjectId(s.id)
    setSubjectQuery(s.name || "")

    if (s.head_teacher_id) {
      setHeadTeacherId(s.head_teacher_id)
      // Primero intenta resolver con la lista cargada
      let autoHT = allHeadTeachers.find(ht => String(ht.id) === String(s.head_teacher_id))
      if (!autoHT) {
        // Fallback: volver a consultar jefes de asignatura y resolver nombre
        try {
          const refreshed = await getHeadTeachers().catch(() => [])
          autoHT = Array.isArray(refreshed)
            ? refreshed.find((ht: any) => String(ht.id) === String(s.head_teacher_id))
            : undefined
        } catch (e) {
          // Ignora errores de red
        }
      }
      const htName = autoHT?.name || autoHT?.user?.name || autoHT?.teacher?.user?.name || ""
      setHeadTeacherQuery(htName)
    } else {
      setHeadTeacherId("")
      setHeadTeacherQuery("")
    }
  }

  const onSelectParams = (p: ParamsOption) => {
    setParamsId(p.id)
    const label = [p.proportion, p.quest_topics, p.amount_quest].filter(Boolean).join(" / ")
    setParamsQuery(label)
  }

  const onSelectHeadTeacher = (ht: HeadTeacherOption) => {
    setHeadTeacherId(ht.id)
    const htName = ht.name || ht.user?.name || ht.teacher?.user?.name || ""
    setHeadTeacherQuery(htName)
  }

  const addManualQuestion = () => {
    const text = newQuestionText.trim()
    if (!text) return
    setManualQuestions((prev) => [...prev, { text }])
    setNewQuestionText("")
  }

  const addSuggestionToManual = (q: any) => {
    const text = (q.question_text || "").trim()
    const id = q.id
    if (!text || !id) return
    // Evitar duplicados
    if (manualQuestions.some(mq => mq.id === id)) return
    setManualQuestions((prev) => [...prev, { id, text }])
  }

  const removeManualQuestion = (idx: number) => {
    setManualQuestions((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!teacherId) {
      toast.error("Validación", { description: "No se pudo obtener el profesor." })
      return
    }

    if (!headTeacherId) {
      toast.error("Validación", { description: "Debes seleccionar un jefe de asignatura." })
      return
    }

    try {
      const payload: any = {
        name: name.trim(),
        difficulty: difficulty || null,
        subject_id: subjectId || null,
        teacher_id: Number(teacherId),
        head_teacher_id: Number(headTeacherId),
        status: "Aprobado",
      }

      if (isManual) {
        if (manualQuestions.length === 0) {
          toast.error("Validación", { description: "Si es modo Manual, debe seleccionar al menos una pregunta." });
          return;
        }
        // Modo manual: parameters_id con valor por defecto, questions con IDs
        payload.parameters_id = 1
        payload.questions = manualQuestions.map(q => q.id)
      } else {
        if (!payload.parameters_id) {
          toast.error("Validación", { description: "Si es modo Automático, debe seleccionar una parametrización." });
          return;
        }
        // Modo automático: parameters_id con datos, questions vacío
        payload.parameters_id = paramsId || null
        payload.questions = []
      }

      const created = await createExam(payload)

      // Si es automático, generar el examen con distribución de preguntas
      if (!isManual && created?.id && subjectId) {
        // Derivar total de preguntas y proporciones desde la parametrización seleccionada
        const selectedParams = allParams.find(p => String(p.id) === String(paramsId))
        const total = Number(selectedParams?.amount_quest) || 0
        const proportionStrRaw = String(selectedParams?.proportion || "")
        const proportionStr = proportionStrRaw.toLowerCase()

        // Mapear porcentajes por tipo directamente desde el string de proportion
        // Formatos soportados:
        // - "50% vof - 50% argumentacion"
        // - "60% opcion multiple - 40% vof"
        // - "50-VoF,50-Argumentacion" (nuevo formato)
        const typeMap: Record<string, string> = {
          "vof": "VoF",
          "verdadero": "VoF",
          "falso": "VoF",
          // Mapear sin tildes a las formas con tildes que espera el backend
          "argumentacion": "Argumentación",
          "argumentación": "Argumentación",
          "opcion multiple": "Opción Múltiple",
          "opción múltiple": "Opción Múltiple",
          "multiple": "Opción Múltiple",
          "múltiple": "Opción Múltiple",
        }
        const pctByType: Record<string, number> = {}

        // Intento 1: nuevo formato "50-VoF,50-Argumentacion"
        const csvParts = proportionStrRaw.split(",").map(s => s.trim()).filter(Boolean)
        if (csvParts.length > 0 && csvParts.every(p => /\d+\s*-\s*/.test(p))) {
          for (const part of csvParts) {
            const m = part.match(/(\d+)\s*-\s*(.+)/)
            if (m) {
              const pct = parseInt(m[1])
              const labelRaw = (m[2] || "").trim()
              const labelLc = labelRaw.toLowerCase()
              const key = Object.keys(typeMap).find(k => labelLc.includes(k))
              if (!isNaN(pct) && key) {
                const canonical = typeMap[key]
                pctByType[canonical] = pct
              }
            }
          }
        }

        // Intento 2: formato con "% tipo" y separadores "-" o "+"
        if (Object.keys(pctByType).length === 0) {
          const parts = proportionStr.split(/[-+]/).map(s => s.trim()).filter(Boolean)
          for (const part of parts) {
            const m = part.match(/(\d+)\s*%\s*(.*)/)
            if (m) {
              const pct = parseInt(m[1])
              const labelLc = (m[2] || "").trim().toLowerCase()
              const key = Object.keys(typeMap).find(k => labelLc.includes(k))
              if (!isNaN(pct) && key) {
                const canonical = typeMap[key]
                pctByType[canonical] = pct
              }
            }
          }
        }

        // Si no se pudo parsear nada, fallback 100% Argumentacion
        if (Object.keys(pctByType).length === 0) {
          pctByType["Argumentación"] = 100
        }

        // Convertir porcentajes a cantidades, asegurando sumar exactamente 'total'
        const tempDistribution: Array<{ type: string; amount: number }> = []
        let assigned = 0
        const entries = Object.entries(pctByType)
        for (let i = 0; i < entries.length; i++) {
          const [type, pct] = entries[i]
          let amount = Math.floor((total * pct) / 100)
          // Para el último tipo, ajustar para que la suma sea total
          if (i === entries.length - 1) {
            amount = Math.max(total - assigned, 0)
          } else {
            assigned += amount
          }
          if (amount > 0) tempDistribution.push({ type, amount })
        }
        await generateExam({
          exam_id: String(created.id),
          subject_id: String(subjectId),
          teacher_id: String(teacherId),
          head_teacher_id: String(headTeacherId),
          questionDistribution: tempDistribution,
        })
      }

      router.push("/dashboard/head_teacher/exam")
    } catch (e: any) {
      toast.error("Error al crear", {
        description: e?.message || "Error inesperado.",
      })
    }
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl">
        <form className="space-y-6 rounded-xl border bg-card p-6 shadow-sm" onSubmit={handleSubmit}>
          <h2 className="font-semibold text-xl">Crear nuevo examen</h2>

          {/* NAME */}
          <div>
            <label className="text-sm text-muted-foreground">Nombre</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del examen" required />
          </div>

          {/* DIFFICULTY */}
          <div>
            <label className="text-sm text-muted-foreground">Dificultad</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full mt-1 p-2 border rounded" required>
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
              onChange={(e) => {
                setSubjectQuery(e.target.value)
                // OPCIONAL: Si el usuario borra la búsqueda, quita la selección
                if (e.target.value === "") setSubjectId("") 
              }}
              className="w-full mt-1 p-2 border rounded"
              placeholder="Escribe para buscar asignaturas..."
            />
            
            {/* Condición para mostrar la lista de sugerencias: */}
            {/* 1. La búsqueda no está vacía, O */}
            {/* 2. Hay una selección, pero la búsqueda no coincide exactamente con el nombre (para poder re-seleccionar) */}
            {(subjectQuery.length > 0 && 
              (String(subjectId) === "" || subjectQuery !== allSubjects.find(s => String(s.id) === String(subjectId))?.name)
            ) && (
              <div className="mt-2">
                {loadingSubjects ? (
                  <div className="text-sm text-muted-foreground">Cargando...</div>
                ) : (
                  <ul className="border rounded max-h-40 overflow-auto">
                    {filteredSubjects.map((s) => (
                      <li
                        key={s.id}
                        className={`p-2 cursor-pointer ${String(subjectId) === String(s.id) ? "bg-slate-100 font-medium" : "hover:bg-gray-50"}`}
                        onClick={() => onSelectSubject(s)}
                      >
                        {s.name}
                        {/* Etiqueta de selección solo si está en la lista visible */}
                        {String(subjectId) === String(s.id) && <span className="text-xs ml-2 text-green-600">(Seleccionada)</span>}
                      </li>
                    ))}
                    {filteredSubjects.length === 0 && <li className="p-2 text-sm text-muted-foreground">No hay asignaturas que coincidan.</li>}
                  </ul>
                )}
              </div>
            )}
            {/* MENSAJE DE CONFIRMACIÓN - Lo mantienes como estaba, pero con el nombre resuelto */}
            <div className="text-xs text-muted-foreground mt-1">
              Asignatura seleccionada: {
                  allSubjects.find(s => String(s.id) === String(subjectId))?.name || "(ninguna)"
              }
            </div>
          </div>

          {/* HEAD TEACHER SEARCH */}
          <div>
            <label className="text-sm text-muted-foreground">Jefe de Asignatura (buscar)</label>


            <input
              value={headTeacherQuery}
              onChange={(e) => {
                setHeadTeacherQuery(e.target.value)
                // OPCIONAL: Si el usuario borra la búsqueda, quita la selección
                if (e.target.value === "") setHeadTeacherId("")
              }}
              className="w-full mt-1 p-2 border rounded"
              // NUEVO: Deshabilitar si ya se ha seleccionado una asignatura (subjectId) y el jefe de asignatura (headTeacherId)
              disabled={!!subjectId && !!headTeacherId}
              placeholder="Escribe para buscar jefe de asignatura..."
            />
            {/* Condición para mostrar sugerencias de Jefes: si la consulta no está vacía Y el ID aún no está seleccionado */}
            {(headTeacherQuery.length > 0 && String(headTeacherId) === "") && (
              <div className="mt-2">
                {loadingHeadTeachers ? (
                  <div className="text-sm text-muted-foreground">Cargando...</div>
                ) : (
                  <ul className="border rounded max-h-40 overflow-auto">
                    {filteredHeadTeachers.map((ht) => {
                      const htName = ht.name || ht.user?.name || ht.teacher?.user?.name || `ID: ${ht.id}`
                      return (
                        <li
                          key={ht.id}
                          className={`p-2 cursor-pointer ${String(headTeacherId) === String(ht.id) ? "bg-slate-100 font-medium" : "hover:bg-gray-50"}`}
                          onClick={() => onSelectHeadTeacher(ht)}
                        >
                          {htName}
                          {String(headTeacherId) === String(ht.id) && <span className="text-xs ml-2 text-green-600">(Seleccionado)</span>}
                        </li>
                      )
                    })}
                    {filteredHeadTeachers.length === 0 && <li className="p-2 text-sm text-muted-foreground">No hay jefes de asignatura que coincidan.</li>}
                  </ul>
                )}
              </div>
            )}
            {/* MENSAJE DE CONFIRMACIÓN */}
            <div className="text-xs text-muted-foreground mt-1">
              Jefe seleccionado: {
                  allHeadTeachers.find(ht => String(ht.id) === String(headTeacherId))?.name || 
                  allHeadTeachers.find(ht => String(ht.id) === String(headTeacherId))?.user?.name || 
                  allHeadTeachers.find(ht => String(ht.id) === String(headTeacherId))?.teacher?.user?.name || 
                  "(ninguno)"
              }
            </div>
          </div>

          {/* MANUAL TOGGLE */}
          <div className="flex items-center gap-2">
            <input id="manualToggle" type="checkbox" checked={isManual} onChange={(e) => setIsManual(e.target.checked)} />
            <label htmlFor="manualToggle" className="text-sm text-muted-foreground">
              Manual
            </label>
          </div>

          {/* PARAMS SEARCH (solo si NO es manual) */}
          {!isManual && (
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
          )}

          {/* MANUAL QUESTIONS UI (solo si es manual) */}
          {isManual && (
            <div className="space-y-4">
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
                        <li key={q.id} className="p-2 hover:bg-slate-100 cursor-pointer" onClick={() => addSuggestionToManual(q)}>
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

              {/* Lista de preguntas añadidas */}
              <ul className="border rounded p-2 space-y-2">
                {manualQuestions.length === 0 && (
                  <li className="text-sm text-muted-foreground">No hay preguntas añadidas.</li>
                )}
                {manualQuestions.map((q, idx) => (
                  <li key={idx} className="flex justify-between items-center">
                    <span className="text-sm">{q.text}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeManualQuestion(idx)}>
                      Quitar
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* ACTIONS */}
          <div className="flex gap-3">
            <Link href="/dashboard/head_teacher/exam">
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
