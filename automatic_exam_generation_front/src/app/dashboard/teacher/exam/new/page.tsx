"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createExam } from "@/services/examService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

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

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

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
        teacher_id: Number(form.teacher_id),
        parameters_id: Number(form.parameters_id),
        head_teacher_id: Number(form.head_teacher_id),
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
            onValueChange={v => handleChange("status", v)}
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
            onValueChange={v => handleChange("difficulty", v)}
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

        {/* IDs manuales por ahora */}
        <div className="space-y-2">
          <Label>ID Materia (subject_id)</Label>
          <Input
            type="number"
            value={form.subject_id}
            onChange={e => handleChange("subject_id", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>ID Profesor (teacher_id)</Label>
          <Input
            type="number"
            value={form.teacher_id}
            onChange={e => handleChange("teacher_id", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>ID Parametrización (parameters_id)</Label>
          <Input
            type="number"
            value={form.parameters_id}
            onChange={e => handleChange("parameters_id", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>ID Jefe de cátedra (head_teacher_id)</Label>
          <Input
            type="number"
            value={form.head_teacher_id}
            onChange={e => handleChange("head_teacher_id", e.target.value)}
          />
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
