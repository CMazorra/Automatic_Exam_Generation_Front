"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getExamById } from "@/services/examService"
import { getExamStudentById, updateExamStudent } from "@/services/examStudentService"
import { getQuestions, getQuestionById } from "@/services/questionService"
import { getAnswers, updateAnswer } from "@/services/answerService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

type Question = {
  id: number
  question_text: string
  type: string
  difficulty?: string
  answer?: string
}

type Answer = {
  exam_id: number
  question_id: number
  student_id: number
  answer_text: string
  score?: number
}

export default function GradeExamPage() {
  const params = useParams()
  const router = useRouter()
  const examId = Number(params?.exam_id)
  const studentId = Number(params?.student_id)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exam, setExam] = useState<any>(null)
  const [examStudent, setExamStudent] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [argScores, setArgScores] = useState<Record<number, number | undefined>>({})
  const [finalScore, setFinalScore] = useState<number | undefined>(undefined)

  useEffect(() => {
    async function load() {
      try {
        const [examData, examStudentData, questionsData, answersData] = await Promise.all([
          getExamById(examId),
          getExamStudentById(examId, studentId),
          getQuestions(),
          getAnswers(),
        ])

        setExam(examData || null)
        setExamStudent(examStudentData || null)

        const parseQuestionId = (item: number | { question_id?: number; id?: number }): number => {
          if (typeof item === "number") return item
          if (typeof item.question_id === "number") return item.question_id
          if (typeof item.id === "number") return item.id
          return NaN
        }

        const examQuestionIds: number[] = (() => {
          if (Array.isArray(examData?.exam_questions)) {
            return examData.exam_questions
              .map(parseQuestionId)
              .filter((id: number) => Number.isFinite(id))
          }
          if (Array.isArray(examData?.questions)) {
            return examData.questions
              .map(parseQuestionId)
              .filter((id: number) => Number.isFinite(id))
          }
          return []
        })()

        const questionsList = (Array.isArray(questionsData) ? questionsData : []) as Question[]
        const examQuestionsFromList = questionsList.filter(q => examQuestionIds.includes(Number(q.id)))

        const missingIds = examQuestionIds.filter(
          (id: number) => !examQuestionsFromList.some(q => Number(q.id) === id)
        )

        let fetchedMissing: Question[] = []
        if (missingIds.length > 0) {
          const fetched = await Promise.all(
            missingIds.map((id: number) => getQuestionById(String(id)).catch(() => null))
          )
          fetchedMissing = fetched.filter(Boolean) as Question[]
        }

        const combinedQuestions = [...examQuestionsFromList, ...fetchedMissing]
        setQuestions(combinedQuestions)

        const answersAll = (Array.isArray(answersData) ? answersData : []) as Answer[]
        const examAnswers = answersAll.filter(
          a => a.exam_id === examId && a.student_id === studentId
        )
        setAnswers(examAnswers)

        const initialArgScores: Record<number, number | undefined> = {}
        examAnswers.forEach(a => {
          const q = combinedQuestions.find((question: Question) => question.id === a.question_id)
          if (q && q.type?.toLowerCase().includes("arg")) {
            initialArgScores[a.question_id] = typeof a.score === "number" ? a.score : undefined
          }
        })
        setArgScores(initialArgScores)

        setFinalScore(
          typeof examStudentData?.score === "number"
            ? Number(examStudentData.score)
            : undefined
        )
      } catch (err) {
        console.error("Error loading grading data:", err)
        toast.error("Error de carga", {
          description: "Ocurrió un error al cargar los datos de calificación.",
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [examId, studentId])

  const grouped = useMemo(() => {
    const byQ: Record<number, { question: Question; answer?: Answer }> = {}
    questions.forEach(q => {
      byQ[q.id] = { question: q }
    })
    answers.forEach(a => {
      if (!byQ[a.question_id]) return
      byQ[a.question_id].answer = a
    })
    return Object.values(byQ)
  }, [questions, answers])

  async function handleSave() {
    try {
      setSaving(true)
      // 1) Persist argumentative answers' scores
      const argOps: Promise<unknown>[] = []
      grouped.forEach(({ question, answer }) => {
        if (!answer) return
        if (question.type?.toLowerCase().includes("arg")) {
          const val = argScores[question.id]
          const scoreToSend = typeof val === "number" ? val : 0
          argOps.push(updateAnswer(examId, question.id, studentId, { score: scoreToSend }))
        }
      })
      await Promise.all(argOps)

      // 2) Save final exam score in exam_student
      const sanitizedFinal = typeof finalScore === "number" ? Number(finalScore) : 0
      await updateExamStudent(examId, studentId, { score: sanitizedFinal })
      toast.success("Calificación guardada", {
        description: "La calificación se ha guardado correctamente.",
      })
      router.back()
    } catch (err) {
      console.error("Error saving grading:", err)
      toast.error("Error al guardar", {
        description: "No se pudo guardar la calificación.",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Cargando examen...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{exam?.name ?? `Examen ${examId}`}</h2>
          <p className="text-sm text-muted-foreground">Estudiante: {studentId}</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={100}
            value={finalScore ?? ""}
            onChange={(e) => {
              const v = e.target.value
              setFinalScore(v === "" ? undefined : Number(v))
            }}
            placeholder="Nota final"
          />
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar nota"}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {grouped.map(({ question, answer }) => (
          <Card key={question.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Pregunta {question.id}</p>
                <p className="text-sm">{question.question_text}</p>
                <p className="text-xs text-muted-foreground">Tipo: {question.type}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Respuesta del estudiante</p>
              <p className="text-sm whitespace-pre-wrap">{answer?.answer_text ?? "Sin respuesta"}</p>
            </div>

            {question.answer && (
              <div>
                <p className="text-sm font-medium">Respuesta esperada</p>
                <p className="text-sm whitespace-pre-wrap">{question.answer}</p>
              </div>
            )}

            {question.type?.toLowerCase().includes("arg") ? (
              <div className="flex items-center gap-2">
                <p className="text-sm">Puntuación (argumentación):</p>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={argScores[question.id] ?? ""}
                  onChange={(e) => {
                    const v = e.target.value
                    setArgScores((prev) => ({ ...prev, [question.id]: v === "" ? undefined : Number(v) }))
                  }}
                />
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                Puntuación calculada por el sistema: {typeof answer?.score === "number" ? answer?.score : "-"}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}