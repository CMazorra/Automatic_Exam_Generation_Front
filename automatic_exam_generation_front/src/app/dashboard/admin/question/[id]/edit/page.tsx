"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldGroup, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter, useParams } from "next/navigation"
import { getQuestionById, updateQuestion } from "@/services/questionService"

export default function QuestionEdit() {
  const router = useRouter()

  // ⛔ DO NOT USE params.id directly anywhere else
  const { id } = useParams() as { id: string }

  const [question, setQuestion] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // form fields
  const [questionText, setQuestionText] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [type, setType] = useState("")
  const [answer, setAnswer] = useState("")
  const [subjectId, setSubjectId] = useState<number | undefined>()
  const [topicId, setTopicId] = useState<number | undefined>()
  const [subTopicId, setSubTopicId] = useState<number | undefined>()
  const [teacherId, setTeacherId] = useState<number | undefined>()

  // 🔹 Load question on mount
  useEffect(() => {
    if (!id) return

    const load = async () => {
      try {
        const data = await getQuestionById(id)
        setQuestion(data)

        // fill form
        setQuestionText(data.question_text)
        setDifficulty(data.difficulty)
        setType(data.type)
        setAnswer(data.answer)
        setSubjectId(data.subject_id)
        setTopicId(data.topic_id)
        setSubTopicId(data.sub_topic_id)
        setTeacherId(data.teacher_id)
      } catch (err) {
        console.error("Error loading question:", err)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [id]) // <-- THIS IS SAFE (uses "id", not "params.id")

  // 🔹 Save
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSaving(true)
    try {
      await updateQuestion(id, {
        question_text: questionText,
        difficulty,
        type,
        answer,
        subject_id: subjectId,
        topic_id: topicId,
        sub_topic_id: subTopicId,
        teacher_id: teacherId,
      })

      router.push(`/dashboard/admin/question/${id}`)
    } catch (err) {
      console.error("Error updating question:", err)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <p>Cargando...</p>
      </main>
    )
  }

  if (!question) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <p className="text-destructive">Pregunta no encontrada</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold">Editar Pregunta</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
              <FieldSet>

                <Field>
                  <FieldLabel>Texto de la pregunta</FieldLabel>
                  <Input
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel>Dificultad</FieldLabel>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Seleccionar dificultad</option>
                    <option value="facil">Fácil</option>
                    <option value="medio">Medio</option>
                    <option value="dificil">Difícil</option>
                  </select>
                </Field>

                <Field>
                  <FieldLabel>Tipo</FieldLabel>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="multiple">Opción múltiple</option>
                    <option value="vf">Verdadero/Falso</option>
                    <option value="ensayo">Ensayo</option>
                  </select>
                </Field>

                <Field>
                  <FieldLabel>Respuesta</FieldLabel>
                  <Input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel>Materia (subject_id)</FieldLabel>
                  <Input
                    type="number"
                    value={subjectId ?? ""}
                    onChange={(e) => setSubjectId(Number(e.target.value))}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel>Tema (topic_id)</FieldLabel>
                  <Input
                    type="number"
                    value={topicId ?? ""}
                    onChange={(e) => setTopicId(Number(e.target.value))}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel>Subtema (sub_topic_id)</FieldLabel>
                  <Input
                    type="number"
                    value={subTopicId ?? ""}
                    onChange={(e) => setSubTopicId(Number(e.target.value))}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel>Profesor (teacher_id)</FieldLabel>
                  <Input
                    type="number"
                    value={teacherId ?? ""}
                    onChange={(e) => setTeacherId(Number(e.target.value))}
                    required
                  />
                </Field>

              </FieldSet>
            </FieldGroup>

            <div className="flex gap-3">
              <Link href={`/dashboard/admin/question/${id}`}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>

              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
