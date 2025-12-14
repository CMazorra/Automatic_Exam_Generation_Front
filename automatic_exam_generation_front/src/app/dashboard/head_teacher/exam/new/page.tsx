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
import Link from "next/link"
import { toast } from "sonner"

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
  const [teacherId, setTeacherId] = useState<number | string>("")
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

  // manual questions
  const [manualQuestions, setManualQuestions] = useState<{ id?: number; text: string }[]>([])
  const [questionSearch, setQuestionSearch] = useState("")
  const [allQuestions, setAllQuestions] = useState<any[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)

  const filteredSubjects = allSubjects.filter((s) =>
    (s.name || "").toLowerCase().includes(subjectQuery.toLowerCase())
  )

  const filteredParams = allParams.filter((p) =>
    [p.proportion, p.quest_topics, p.amount_quest]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(paramsQuery.toLowerCase())
  )

  const filteredHeadTeachers = allHeadTeachers.filter((ht) => {
    const name = ht.name || ht.user?.name || ht.teacher?.user?.name || ""
    return name.toLowerCase().includes(headTeacherQuery.toLowerCase())
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

  // current user
  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUser()
        if (user?.id) setTeacherId(user.id)
        else throw new Error()
      } catch {
        const raw = localStorage.getItem("userId")
        if (raw) setTeacherId(Number(raw))
        else {
          toast.error("Error de autenticación", {
            description: "No se pudo obtener el ID del profesor.",
          })
        }
      }
    }
    loadUser()
  }, [])

  // subjects
  useEffect(() => {
    if (!teacherId) return
    let mounted = true

    async function loadSubjects() {
      try {
        setLoadingSubjects(true)
        const list = await getSubjectsFlatByTeacherID(String(teacherId)).catch(() => [])
        if (mounted) setAllSubjects(Array.isArray(list) ? list : [])
      } catch {
        toast.error("Error de carga", { description: "No se pudieron cargar las asignaturas." })
      } finally {
        if (mounted) setLoadingSubjects(false)
      }
    }

    loadSubjects()
    return () => {
      mounted = false
    }
  }, [teacherId])

  // params + head teachers
  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        setLoadingParams(true)
        setLoadingHeadTeachers(true)

        const [params, heads] = await Promise.all([
          getParams().catch(() => []),
          getHeadTeachers().catch(() => []),
        ])

        if (!mounted) return
        setAllParams(params)
        setAllHeadTeachers(heads)
      } catch {
        toast.error("Error de carga", { description: "No se pudieron cargar los datos." })
      } finally {
        if (mounted) {
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

  // questions for manual
  useEffect(() => {
    if (!isManual) return
    let mounted = true

    async function loadQuestions() {
      try {
        setLoadingQuestions(true)
        const qs = await getQuestions().catch(() => [])
        const normalized = qs.map((q: any) => ({
          ...q,
          question_text: q.question_text ?? q.text ?? "",
        }))
        if (mounted) setAllQuestions(normalized)
      } catch {
        toast.error("Error de carga", { description: "No se pudo cargar el banco de preguntas." })
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
    setParamsQuery([p.proportion, p.quest_topics, p.amount_quest].filter(Boolean).join(" / "))
  }

  const addManualQuestion = (q: any) => {
    if (!q?.id || manualQuestions.some(m => m.id === q.id)) return
    setManualQuestions(prev => [...prev, { id: q.id, text: q.question_text }])
  }

  const removeManualQuestion = (idx: number) => {
    setManualQuestions(prev => prev.filter((_, i) => i !== idx))
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
        difficulty,
        subject_id: subjectId,
        teacher_id: Number(teacherId),
        head_teacher_id: Number(headTeacherId),
        status: "Aprobado",
        parameters_id: isManual ? 1 : paramsId || null,
        questions: isManual ? manualQuestions.map(q => q.id) : [],
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
          <h2 className="text-xl font-semibold">Crear nuevo examen</h2>

          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del examen" required />

          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full p-2 border rounded" required>
            <option value="">Seleccione dificultad</option>
            <option value="facil">Fácil</option>
            <option value="medio">Medio</option>
            <option value="dificil">Difícil</option>
          </select>

          <div className="flex gap-3">
            <Link href="/dashboard/head_teacher/exam">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit">Crear examen</Button>
          </div>
        </form>
      </div>
    </main>
  )
}
