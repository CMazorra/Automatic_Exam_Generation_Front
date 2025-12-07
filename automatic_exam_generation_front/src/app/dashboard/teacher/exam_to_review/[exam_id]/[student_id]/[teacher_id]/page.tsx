"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getExamById } from "@/services/examService"
import { getExamStudentById, updateExamStudent } from "@/services/examStudentService"
import { getQuestions } from "@/services/questionService"
import { getAnswers, updateAnswer } from "@/services/answerService"
import { updateReevaluation, getReevaluationById } from "@/services/reevaluationService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

type Question = {
  id: number
  question_text: string
  type: string
  difficulty?: string
}

type Answer = {
  exam_id: number
  question_id: number
  student_id: number
  answer_text: string
  score?: number
}

export default function GradeReevaluationPage() {
  const params = useParams()
  const router = useRouter()
  const examId = Number(params?.exam_id)
  const studentId = Number(params?.student_id)
  const teacherId = Number(params?.teacher_id)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exam, setExam] = useState<any>(null)
  const [examStudent, setExamStudent] = useState<any>(null)
  const [reeval, setReeval] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [argScores, setArgScores] = useState<Record<number, number>>({})
  const [finalScore, setFinalScore] = useState<number>(0)

  useEffect(() => {
    async function load() {
      try {
        const [examData, examStudentData, questionsData, answersData, reevaluationData] = await Promise.all([
          getExamById(examId),
          getExamStudentById(examId, studentId),
          getQuestions(),
          getAnswers(),
          getReevaluationById(examId, studentId, teacherId).catch(() => null),
        ])

        setExam(examData || null)
        setExamStudent(examStudentData || null)
        setReeval(reevaluationData || null)

        const examQuestionIds: number[] = Array.isArray(examData?.questions)
          ? examData.questions.map((q: any) => q.id ?? q)
          : []

        const questionsMap = (Array.isArray(questionsData) ? questionsData : []) as Question[]
        const examQuestions = questionsMap.filter(q => examQuestionIds.includes(Number(q.id)))
        setQuestions(examQuestions)

        const answersAll = (Array.isArray(answersData) ? answersData : []) as Answer[]
        const examAnswers = answersAll.filter(
          a => a.exam_id === examId && a.student_id === studentId
        )
        setAnswers(examAnswers)

        const initialArgScores: Record<number, number> = {}
        examAnswers.forEach(a => {
          const q = examQuestions.find(q => q.id === a.question_id)
          if (q && q.type?.toLowerCase().includes("arg")) {
            initialArgScores[a.question_id] = typeof a.score === "number" ? a.score : 0
          }
        })
        setArgScores(initialArgScores)

        // Start from existing reevaluation score if present, else from exam_student
        const baseScore =
          typeof reevaluationData?.score === "number"
            ? reevaluationData.score
            : Number(examStudentData?.score ?? 0)
        setFinalScore(Number(baseScore))
      } catch (err) {
        console.error("Error loading reevaluation grading data:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [examId, studentId, teacherId])

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
      const argOps: Promise<any>[] = []
      grouped.forEach(({ question, answer }) => {
        if (!answer) return
        if (question.type?.toLowerCase().includes("arg")) {
          const newScore = Number(argScores[question.id] ?? 0)
          argOps.push(
            updateAnswer(examId, question.id, studentId, { score: newScore })
          )
        }
      })
      await Promise.all(argOps)

      // 2) Update exam_student score
      const newFinal = Number(finalScore)
      const currentExamScore = Number(examStudent?.score ?? 0)
      await updateExamStudent(examId, studentId, { score: newFinal })

      // 3) Update reevaluation:
      // - If newFinal > current exam score -> set reevaluation to newFinal
      // - Else set reevaluation to current exam score
      const reevalScoreToSet = newFinal > currentExamScore ? newFinal : currentExamScore
      await updateReevaluation(examId, studentId, teacherId, { score: reevalScoreToSet })

      router.back()
    } catch (err) {
      console.error("Error saving reevaluation grading:", err)
      alert("Error al guardar la calificación de recalificación")
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
          <h2 className="text-lg font-semibold">
            {exam?.name ?? `Examen ${examId}`} <span className="text-purple-700 text-sm ml-2">(Recalificación)</span>
          </h2>
          <p className="text-sm text-muted-foreground">Estudiante: {studentId} • Profesor: {teacherId}</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={100}
            value={finalScore}
            onChange={(e) => setFinalScore(Number(e.target.value))}
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

            {question.type?.toLowerCase().includes("arg") ? (
              <div className="flex items-center gap-2">
                <p className="text-sm">Puntuación (argumentación):</p>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={argScores[question.id] ?? 0}
                  onChange={(e) =>
                    setArgScores((prev) => ({ ...prev, [question.id]: Number(e.target.value) }))
                  }
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