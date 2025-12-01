"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createExam } from "@/services/examService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { getSubjects } from "@/services/subjectService"
import { getTeachers } from "@/services/teacherService"
import { getParams } from "@/services/paramsService"

export default function NewExamPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: "",
    status: "DRAFT",
    difficulty: "MEDIUM",
    subject_id: "",
    teacher_id: "",
    parameters_id: "",
    head_teacher_id: "",
  })

  // data lists for searchable selects
  const [subjects, setSubjects] = useState<any[]>([])
  const [subjectQuery, setSubjectQuery] = useState("")
  const [teachers, setTeachers] = useState<any[]>([])
  const [teacherQuery, setTeacherQuery] = useState("")
  const [paramsList, setParamsList] = useState<any[]>([])
  const [paramsQuery, setParamsQuery] = useState("")
  const [headTeachers, setHeadTeachers] = useState<any[]>([])
  const [headQuery, setHeadQuery] = useState("")

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // load lists for selects
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [s, t, p] = await Promise.all([getSubjects(), getTeachers(), getParams()])
        if (!mounted) return
        setSubjects(Array.isArray(s) ? s : [])
        setTeachers(Array.isArray(t) ? t : [])
        setParamsList(Array.isArray(p) ? p : [])
        // head teachers: those with isHeadTeacher true, fallback to teachers same list
        const heads = (Array.isArray(t) ? t.filter((x: any) => x.isHeadTeacher) : [])
        setHeadTeachers(heads.length ? heads : (Array.isArray(t) ? t : []))
      } catch (err) {
        console.error("Error loading lists for exam form:", err)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const submit = async () => {
    if (!form.name || !form.subject_id) {
      alert("Nombre y subject_id son obligatorios")
      return
    }

    try {
      await createExam({
        name: form.name,
        status: form.status,
        difficulty: form.difficulty,
        subject_id: Number(form.subject_id),
        teacher_id: form.teacher_id ? Number(form.teacher_id) : undefined,
        parameters_id: form.parameters_id ? Number(form.parameters_id) : undefined,
        head_teacher_id: form.head_teacher_id ? Number(form.head_teacher_id) : undefined,
      })

      router.push("/dashboard/teacher/exam")
    } catch (err: any) {
      alert(err.message || "Error al crear examen")
    }
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-lg mx-auto space-y-6 p-6 border rounded-xl bg-card shadow-sm">
        <h2 className="text-xl font-semibold">Crear Examen</h2>

        {/* Nombre */}
        <div className="space-y-2">
          <Label>Nombre del examen</Label>
          <Input
            placeholder="Examen Parcial 1"
            value={form.name}
            onChange={e => handleChange("name", e.target.value)}
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>Estado</Label>
          <Select
            value={form.status}
            onValueChange={(v: string) => handleChange("status", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Borrador</SelectItem>
              <SelectItem value="PUBLISHED">Publicado</SelectItem>
              <SelectItem value="CLOSED">Cerrado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <Label>Dificultad</Label>
          <Select
            value={form.difficulty}
            onValueChange={(v: string) => handleChange("difficulty", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar dificultad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EASY">Fácil</SelectItem>
              <SelectItem value="MEDIUM">Media</SelectItem>
              <SelectItem value="HARD">Difícil</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Subject searchable */}
        <div className="space-y-2">
          <Label>Asignatura</Label>
          <Input
            placeholder="Buscar asignatura..."
            value={subjectQuery}
            onChange={e => setSubjectQuery(e.target.value)}
          />
          <div className="mt-2">
            <ul className="border rounded max-h-40 overflow-auto">
              {subjects
                .filter(s => (s.name || "").toLowerCase().includes(subjectQuery.trim().toLowerCase()))
                .map(s => (
                  <li
                    key={s.id}
                    className={`p-2 cursor-pointer ${String(form.subject_id) === String(s.id) ? "bg-slate-100" : ""}`}
                    onClick={() => { handleChange("subject_id", String(s.id)); setSubjectQuery(s.name) }}
                  >
                    {s.name}
                  </li>
                ))}
            </ul>
            <div className="text-xs text-muted-foreground mt-1">Seleccionada: {subjects.find(s => String(s.id) === String(form.subject_id))?.name || "(ninguna)"}</div>
          </div>
        </div>

        {/* Teacher searchable */}
        <div className="space-y-2">
          <Label>Profesor</Label>
          <Input placeholder="Buscar profesor..." value={teacherQuery} onChange={e => setTeacherQuery(e.target.value)} />
          <div className="mt-2">
            <ul className="border rounded max-h-40 overflow-auto">
              {teachers
                .filter(t => ((t.user?.name ?? t.name ?? t.account) || "").toLowerCase().includes(teacherQuery.trim().toLowerCase()))
                .map(t => (
                  <li
                    key={t.id}
                    className={`p-2 cursor-pointer ${String(form.teacher_id) === String(t.id) ? "bg-slate-100" : ""}`}
                    onClick={() => { handleChange("teacher_id", String(t.id)); setTeacherQuery((t.user?.name ?? t.name ?? t.account) || String(t.id)) }}
                  >
                    {t.user?.name ?? t.name ?? t.account}
                  </li>
                ))}
            </ul>
            <div className="text-xs text-muted-foreground mt-1">Seleccionado: {teachers.find(t => String(t.id) === String(form.teacher_id))?.user?.name ?? teachers.find(t => String(t.id) === String(form.teacher_id))?.name ?? "(ninguno)"}</div>
          </div>
        </div>

        {/* Parameters searchable */}
        <div className="space-y-2">
          <Label>Parametrización</Label>
          <Input placeholder="Buscar parametrización..." value={paramsQuery} onChange={e => setParamsQuery(e.target.value)} />
          <div className="mt-2">
            <ul className="border rounded max-h-40 overflow-auto">
              {paramsList
                .filter(p => ((p.proportion ?? "") + " " + (p.quest_topics ?? "")).toLowerCase().includes(paramsQuery.trim().toLowerCase()))
                .map(p => (
                  <li
                    key={p.id}
                    className={`p-2 cursor-pointer ${String(form.parameters_id) === String(p.id) ? "bg-slate-100" : ""}`}
                    onClick={() => { handleChange("parameters_id", String(p.id)); setParamsQuery(`${p.proportion} / ${p.quest_topics}`) }}
                  >
                    {p.proportion} — {p.quest_topics}
                  </li>
                ))}
            </ul>
            <div className="text-xs text-muted-foreground mt-1">Seleccionado: {paramsList.find(p => String(p.id) === String(form.parameters_id)) ? `${paramsList.find(p => String(p.id) === String(form.parameters_id))?.proportion} / ${paramsList.find(p => String(p.id) === String(form.parameters_id))?.quest_topics}` : "(ninguno)"}</div>
          </div>
        </div>

        {/* Head teacher searchable */}
        <div className="space-y-2">
          <Label>Jefe de cátedra</Label>
          <Input placeholder="Buscar jefe..." value={headQuery} onChange={e => setHeadQuery(e.target.value)} />
          <div className="mt-2">
            <ul className="border rounded max-h-40 overflow-auto">
              {headTeachers
                .filter(h => ((h.user?.name ?? h.name ?? h.account) || "").toLowerCase().includes(headQuery.trim().toLowerCase()))
                .map(h => (
                  <li
                    key={h.id}
                    className={`p-2 cursor-pointer ${String(form.head_teacher_id) === String(h.id) ? "bg-slate-100" : ""}`}
                    onClick={() => { handleChange("head_teacher_id", String(h.id)); setHeadQuery((h.user?.name ?? h.name ?? h.account) || String(h.id)) }}
                  >
                    {h.user?.name ?? h.name ?? h.account}
                  </li>
                ))}
            </ul>
            <div className="text-xs text-muted-foreground mt-1">Seleccionado: {headTeachers.find(h => String(h.id) === String(form.head_teacher_id))?.user?.name ?? headTeachers.find(h => String(h.id) === String(form.head_teacher_id))?.name ?? "(ninguno)"}</div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => router.push("/dashboard/teacher/exam")}>
            Cancelar
          </Button>
          <Button onClick={submit}>Crear</Button>
        </div>
      </div>
    </main>
  )
}
