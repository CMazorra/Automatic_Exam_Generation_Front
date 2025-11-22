"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldGroup, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { postQuestion } from "@/services/questionService"

export default function NewQuestionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // 🔹 Igual que el formulario de usuarios: TODO en strings
  const [form, setForm] = useState({
    question_text: "",
    difficulty: "",
    type: "",
    answer: "",
    subject_id: "",
    topic_id: "",
    sub_topic_id: "",
    teacher_id: "",
  })

  // 🔹 Misma función genérica handleChange
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target
    setForm((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !form.question_text.trim() ||
      !form.difficulty ||
      !form.type ||
      !form.answer.trim() ||
      !form.subject_id ||
      !form.topic_id ||
      !form.sub_topic_id ||
      !form.teacher_id
    ) {
      alert("Por favor, completa todos los campos obligatorios.")
      return
    }

    setIsLoading(true)

    try {
      await postQuestion({
        question_text: form.question_text.trim(),
        difficulty: form.difficulty,
        type: form.type,
        answer: form.answer.trim(),

        subject_id: Number(form.subject_id),
        topic_id: Number(form.topic_id),
        sub_topic_id: Number(form.sub_topic_id),
        teacher_id: Number(form.teacher_id),
      })

      alert("✅ Pregunta creada correctamente.")
      router.push("/dashboard/admin/question")
    } catch (err) {
      console.error(err)
      alert("❌ Hubo un error al crear la pregunta.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">

          <h2 className="font-semibold leading-none text-xl">
            Nueva Pregunta
          </h2>

          <FieldGroup>
            <FieldSet>

              <Field>
                <FieldLabel htmlFor="question_text">Texto de la pregunta</FieldLabel>
                <Input
                  id="question_text"
                  placeholder="Escribe la pregunta..."
                  value={form.question_text}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="difficulty">Dificultad</FieldLabel>
                <select
                  id="difficulty"
                  value={form.difficulty}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar dificultad</option>
                  <option value="facil">Fácil</option>
                  <option value="medio">Medio</option>
                  <option value="dificil">Difícil</option>
                </select>
              </Field>

              <Field>
                <FieldLabel htmlFor="type">Tipo</FieldLabel>
                <select
                  id="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="multiple">Opción múltiple</option>
                  <option value="vf">Verdadero/Falso</option>
                  <option value="ensayo">Ensayo</option>
                </select>
              </Field>

              <Field>
                <FieldLabel htmlFor="answer">Respuesta</FieldLabel>
                <Input
                  id="answer"
                  placeholder="Respuesta correcta..."
                  value={form.answer}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="subject_id">Materia (subject_id)</FieldLabel>
                <Input
                  id="subject_id"
                  type="number"
                  placeholder="ID de la materia"
                  value={form.subject_id}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="topic_id">Tema (topic_id)</FieldLabel>
                <Input
                  id="topic_id"
                  type="number"
                  placeholder="ID del tema"
                  value={form.topic_id}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="sub_topic_id">Subtema (sub_topic_id)</FieldLabel>
                <Input
                  id="sub_topic_id"
                  type="number"
                  placeholder="ID del subtema"
                  value={form.sub_topic_id}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="teacher_id">Profesor (teacher_id)</FieldLabel>
                <Input
                  id="teacher_id"
                  type="number"
                  placeholder="ID del profesor"
                  value={form.teacher_id}
                  onChange={handleChange}
                  required
                />
              </Field>

            </FieldSet>
          </FieldGroup>

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear Pregunta"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/admin/question")}
            >
              Cancelar
            </Button>
          </div>

        </div>
      </form>
    </main>
  )
}
