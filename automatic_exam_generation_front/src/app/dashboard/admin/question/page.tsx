"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ListViewWithAdd } from "@/components/list-view-with-add"
import { getQuestions } from "@/services/questionService"
import { Button } from "@/components/ui/button"

export default function QuestionPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getQuestions()

        // Asegurar compatibilidad: backend devuelve así
        const mapped = data.map((q: any) => ({
          ...q,
          id_q: q.id ?? q.id_q ?? q._id, // seguridad por si cambia
        }))

        setQuestions(mapped)
      } catch (err) {
        console.error("Error loading questions:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Cargando preguntas...</p>
      </main>
    )
  }

  return (
    <ListViewWithAdd
      title="Lista de Preguntas"
      entities={questions}
      sortFields={[
        { value: "question_text", label: "Texto" },
        { value: "difficulty", label: "Dificultad" },
      ]}
      filterFields={[
        { value: "question_text", label: "Texto" },
        { value: "type", label: "Tipo" },
      ]}
      getEntityKey={(q) => `${q.id_q}`}
      renderEntity={(q) => (
        <div className="rounded-lg border p-4 bg-card hover:bg-accent/5 transition">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold">{q.question_text}</h3>

              <p className="text-sm text-muted-foreground">
                Dificultad: {q.difficulty}
              </p>

              <p className="text-xs text-muted-foreground">
                Tipo: {q.type}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                router.push(`/dashboard/admin/question/${q.id_q}/page`)
              }
            >
              Ver detalles
            </Button>
          </div>
        </div>
      )}
      onAdd={() => router.push("/dashboard/admin/question/create")}
    />
  )
}
