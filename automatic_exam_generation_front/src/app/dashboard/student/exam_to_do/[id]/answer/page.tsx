"use client"

import { useEffect, useState, ChangeEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getExamById } from '@/services/examService'
import { getQuestionById } from '@/services/questionService'
import { getCurrentUser } from '@/services/authService'
import { postStudentAnswers } from '@/services/answerService'
import { updateExamStudent } from '@/services/examStudentService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface Question {
  id: number
  question_text: string
  type: 'Argumentación' | 'VoF' | 'Selección Múltiple'
  difficulty: string
  answers?: { id: number; answer_text: string; is_correct: boolean }[]
}

interface ExamDetail {
  id: number
  name: string
  exam_questions: { question_id: number }[]
}

export default function AnswerExamPage() {
  const params = useParams()
  const router = useRouter()
  const examId = Number(params.id)

  const [loading, setLoading] = useState(true)
  const [exam, setExam] = useState<ExamDetail | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [studentId, setStudentId] = useState<number | null>(null)

  useEffect(() => {
    if (!examId) return

    async function loadExamData() {
      setLoading(true)
      try {
        const user = await getCurrentUser()
        const currentStudentId = user?.id ?? null
        setStudentId(currentStudentId)

        if (!currentStudentId) return

        const examDetail: ExamDetail = await getExamById(examId)
        setExam(examDetail)

        const questionIds = examDetail.exam_questions.map(eq => eq.question_id)
        const fullQuestions: Question[] = await Promise.all(
          questionIds.map(id => getQuestionById(String(id)))
        )

        setQuestions(fullQuestions)
      } catch (e) {
        console.error(e)
        toast.error('Error de Carga', {
          description: 'No se pudo cargar el examen. Inténtalo nuevamente.',
        })
      } finally {
        setLoading(false)
      }
    }

    loadExamData()
  }, [examId])

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const renderAnswerInput = (q: Question) => {
    const currentAnswer = answers[q.id] || ''
    const inputName = `question-${q.id}`

    const handleRadioChange = (e: ChangeEvent<HTMLInputElement>) => {
      handleAnswerChange(q.id, e.target.value)
    }

    switch (q.type) {
      case 'Argumentación':
      case 'Selección Múltiple':
        return (
          <Textarea
            placeholder="Escribe tu respuesta aquí..."
            value={currentAnswer}
            onChange={e => handleAnswerChange(q.id, e.target.value)}
            rows={q.type === 'Argumentación' ? 6 : 3}
          />
        )

      case 'VoF':
        return (
          <div className="flex space-x-8">
            {['Verdadero', 'Falso'].map(option => (
              <div key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${inputName}-${option}`}
                  name={inputName}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={handleRadioChange}
                  className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                />
                <Label htmlFor={`${inputName}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        )

      default:
        return <p className="text-red-500">Tipo de pregunta no soportado</p>
    }
  }

  const submitExam = async () => {
    if (!exam || !studentId) {
      throw new Error('No se pudo identificar al estudiante o examen.')
    }

    const answersPayload = questions.map(q => ({
      question_id: q.id,
      answer_text: answers[q.id] || '',
      exam_id: exam.id,
      student_id: studentId,
    }))

    const unanswered = answersPayload.filter(a => a.answer_text.trim() === '')

    if (unanswered.length > 0) {
      const ok = window.confirm(
        `Tienes ${unanswered.length} pregunta(s) sin responder. ¿Deseas enviar igualmente?`
      )
      if (!ok) throw new Error('Envío cancelado.')
    }

    setIsSubmitting(true)
    try {
      await postStudentAnswers(answersPayload)
      await updateExamStudent(exam.id, studentId, { score: 0 })
      router.push('/dashboard/student/exam_done')
      return 'Examen enviado correctamente. Pendiente de calificación.'
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = () => {
    toast.promise(submitExam(), {
      loading: 'Enviando respuestas...',
      success: msg => msg,
      error: err => err.message || 'Error al enviar el examen.',
    })
  }

  if (loading) return <p className="p-8">Cargando examen...</p>

  if (!exam || questions.length === 0) {
    return (
      <p className="p-8 text-red-500">
        Error: no se pudo cargar el examen o no tiene preguntas.
      </p>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-2">
        Realizar Examen: {exam.name}
      </h1>
      <p className="text-xl text-muted-foreground mb-8">
        Responde cada pregunta y envía el examen al finalizar.
      </p>

      <div className="space-y-10">
        {questions.map((q, index) => (
          <Card key={q.id}>
            <CardHeader>
              <CardTitle className="text-xl">
                {index + 1}. {q.question_text}{' '}
                <span className="text-sm font-normal text-muted-foreground">
                  ({q.type})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>{renderAnswerInput(q)}</CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t flex justify-end">
        <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
          {isSubmitting ? 'Enviando respuestas...' : 'Finalizar y Enviar Examen'}
        </Button>
      </div>
    </div>
  )
}
