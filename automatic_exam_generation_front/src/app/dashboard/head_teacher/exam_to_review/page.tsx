"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getExamStudents } from "@/services/examStudentService"
import { getAnswers } from "@/services/answerService"
import { getExamById } from "@/services/examService"
import { getUserById } from "@/services/userService"
import { getCurrentUser } from "@/services/authService"
import { getSubjectsByTeacherID } from "@/services/subjectService"
import { getReevaluations } from "@/services/reevaluationService"
import { ListView } from "@/components/list-view"
import { Button } from "@/components/ui/button"

interface ExamStudentWithDetails {
  id: string | number
  exam_id: number
  student_id: number
  teacher_id: number
  score: number
  examName?: string
  studentName?: string
  answerCount?: number
  isReevaluation?: boolean
}

export default function TeacherExamToReviewPage() {
  const router = useRouter()
  const [examsToReview, setExamsToReview] = useState<ExamStudentWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadExamsToReview() {
      try {
        let teacherId: string | number | null = null
        try {
          const user = await getCurrentUser()
          teacherId = user?.id
        } catch {
          const raw = typeof window !== "undefined" ? localStorage.getItem("userId") : null
          teacherId = raw ? raw : null
        }

        if (!teacherId) {
          console.warn("No se pudo obtener el ID del profesor")
          setExamsToReview([])
          setLoading(false)
          return
        }

        const subjectsData = await getSubjectsByTeacherID(String(teacherId))
        const subjects = Array.isArray(subjectsData) ? subjectsData : []
        const subjectIds = new Set(subjects.map((s: any) => s.id))

        const [examStudentsData, answersData, reevaluationsData] = await Promise.all([
          getExamStudents(),
          getAnswers(),
          getReevaluations(),
        ])

        const examStudents = Array.isArray(examStudentsData) ? examStudentsData : []
        const answers = Array.isArray(answersData) ? answersData : []
        const reevaluations = Array.isArray(reevaluationsData) ? reevaluationsData : []

        // Exams to review: score === 0 and has at least one answer
        const unscored = examStudents.filter((es: any) => es.score === 0)

        const baseExamsWithAnswers = await Promise.all(
          unscored
            .filter((es: any) =>
              answers.some(
                (answer: any) =>
                  answer.exam_id === es.exam_id &&
                  answer.student_id === es.student_id
              )
            )
            .map(async (es: any) => {
              try {
                const exam = await getExamById(es.exam_id)
                if (!subjectIds.has(exam?.subject_id)) return null

                const student = await getUserById(es.student_id)
                const answerCount = answers.filter(
                  (answer: any) =>
                    answer.exam_id === es.exam_id &&
                    answer.student_id === es.student_id
                ).length

                return {
                  id: `${es.exam_id}-${es.student_id}`,
                  exam_id: es.exam_id,
                  student_id: es.student_id,
                  teacher_id: es.teacher_id,
                  score: es.score,
                  examName: exam?.name || `Examen ${es.exam_id}`,
                  studentName: student?.name || `Estudiante ${es.student_id}`,
                  answerCount,
                  isReevaluation: false,
                } as ExamStudentWithDetails
              } catch (error) {
                console.error("Error loading exam/student details:", error)
                return null
              }
            })
        )

        // Reevaluations: must belong to this teacher, exam in teacher subjects, score === 0, and has answers
        const reevaluationItems = await Promise.all(
          reevaluations
            .filter((rv: any) => String(rv.teacher_id) === String(teacherId))
            .filter((rv: any) => rv.score === 0)
            .filter((rv: any) =>
              answers.some(
                (answer: any) =>
                  answer.exam_id === rv.exam_id &&
                  answer.student_id === rv.student_id
              )
            )
            .map(async (rv: any) => {
              try {
                const exam = await getExamById(rv.exam_id)
                if (!subjectIds.has(exam?.subject_id)) return null

                const student = await getUserById(rv.student_id)
                const answerCount = answers.filter(
                  (answer: any) =>
                    answer.exam_id === rv.exam_id &&
                    answer.student_id === rv.student_id
                ).length

                return {
                  id: `reeval-${rv.exam_id}-${rv.student_id}`,
                  exam_id: rv.exam_id,
                  student_id: rv.student_id,
                  teacher_id: rv.teacher_id,
                  score: rv.score,
                  examName: exam?.name || `Examen ${rv.exam_id}`,
                  studentName: student?.name || `Estudiante ${rv.student_id}`,
                  answerCount,
                  isReevaluation: true,
                } as ExamStudentWithDetails
              } catch (error) {
                console.error("Error loading reevaluation details:", error)
                return null
              }
            })
        )

        const combined = [
          ...baseExamsWithAnswers.filter((x): x is ExamStudentWithDetails => x !== null),
          ...reevaluationItems.filter((x): x is ExamStudentWithDetails => x !== null),
        ]

        setExamsToReview(combined)
      } catch (error) {
        console.error("Error loading exams to review:", error)
        setExamsToReview([])
      } finally {
        setLoading(false)
      }
    }

    loadExamsToReview()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Cargando exámenes a calificar...</p>
      </div>
    )
  }

  return (
    <ListView
      title="Exámenes a calificar"
      entities={examsToReview}
      sortFields={[
        { value: "examName", label: "Examen" },
        { value: "studentName", label: "Estudiante" },
        { value: "answerCount", label: "Respuestas" },
      ]}
      filterFields={[
        { value: "examName", label: "Examen" },
        { value: "studentName", label: "Estudiante" },
      ]}
      renderEntity={(examStudent) => (
        <div className="rounded-lg border border-border bg-card p-4 hover:bg-accent/5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-card-foreground">
                  {examStudent.examName}
                </h3>
                {examStudent.isReevaluation && (
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-xs">
                    Recalificación
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Estudiante: {examStudent.studentName}
              </p>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() =>
                router.push(
                  examStudent.isReevaluation
                    ? `/dashboard/head_teacher/exam_to_review/${examStudent.exam_id}/${examStudent.student_id}/${examStudent.teacher_id}`
                    : `/dashboard/head_teacher/exam_to_review/${examStudent.exam_id}/${examStudent.student_id}`
                )
              }
            >
              Calificar
            </Button>
          </div>

          <div className="flex gap-2 text-xs mt-3">
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              {examStudent.answerCount} respuesta{examStudent.answerCount !== 1 ? "s" : ""}
            </span>
            <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">
              Sin calificar
            </span>
          </div>
        </div>
      )}
    />
  )
}