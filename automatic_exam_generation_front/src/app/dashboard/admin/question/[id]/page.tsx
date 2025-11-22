"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter, useParams } from "next/navigation"
import { getQuestionById, deleteQuestion } from "@/services/questionService"

export default function QuestionView() {
  const params = useParams()
  const id = params?.id as string
  const [question, setQuestion] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!id) return
    const fetchQuestion = async () => {
      try {
        const data = await getQuestionById(id)
        setQuestion({ ...data, id_q: data.id_q ?? data.id ?? data._id })
      } catch (error) {
        console.error("Error fetching question:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchQuestion()
  }, [id])

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">Cargando...</div>
      </main>
    )
  }

  if (!question) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center text-destructive">Pregunta no encontrada</div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">

          <div>
            <h2 className="font-semibold leading-none">Pregunta #{question.id_q}</h2>
            <p className="text-muted-foreground text-sm">{question.question_text}</p>
          </div>

          <div className="space-y-2">
            <p><strong>Dificultad:</strong> {question.difficulty}</p>
            <p><strong>Tipo:</strong> {question.type}</p>
            <p><strong>Respuesta:</strong> {question.answer}</p>

            <p><strong>Materia:</strong> {question.subject_id}</p>
            <p><strong>Tema:</strong> {question.topic_id}</p>
            <p><strong>Subtema:</strong> {question.sub_topic_id}</p>
            <p><strong>Profesor:</strong> {question.teacher_id}</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Link href="/dashboard/admin/question">
              <Button variant="outline">Volver</Button>
            </Link>

            <Button
              onClick={() =>
                router.push(`/dashboard/admin/question/${question.id_q}/edit`)
              }
            >
              Editar
            </Button>

            <Button
              variant="destructive"
              onClick={async () => {
                if (!confirm(`¿Seguro que deseas eliminar esta pregunta?`)) return
                try {
                  await deleteQuestion(question.id_q)
                  router.push("/dashboard/admin/question")
                } catch (error) {
                  console.error("Error deleting question:", error)
                  alert("Hubo un error al eliminar la pregunta.")
                }
              }}
            >
              Eliminar
            </Button>
          </div>

        </div>
      </div>
    </main>
  )
}
