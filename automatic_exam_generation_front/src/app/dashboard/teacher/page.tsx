"use client"

import React, { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getCurrentUser } from "@/services/authService"
import { getExams, getExamById } from "@/services/examService"
import { getApprovedExams, updateApprovedExam } from "@/services/approvedExamService"

type Exam = {
  id: number | string
  title?: string
  teacher_id?: number | string
  [key: string]: any
}

type ApprovedExam = {
  date?: string | Date
  date_id?: number | string
  exam_id: number | string
  head_teacher_id: number | string
  guidelines: string
  seen?: boolean
  [key: string]: any
}

type NotificationItem = {
  key: string
  examId: number | string
  headTeacherId: number | string
  date: string | Date
  title: string
  message: string
  guidelines: string
}

export default function TeacherDashboardPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true)
        setLoadError(null)

        const currentUser = await getCurrentUser()
        const teacherId = currentUser?.id
        if (!teacherId) {
          setNotifications([])
          setLoading(false)
          return
        }

        // Fetch approved exams (all) and all exams, then correlate
        const [approved, exams] = await Promise.all<ApprovedExam[], Exam[]>([
          getApprovedExams(),
          getExams(),
        ])

        // Build exam map by id for quick lookup
        const examById = new Map<string | number, Exam>()
        exams.forEach((e) => examById.set(e.id, e))

        // Filter approved entries: seen=false and exam belongs to current teacher
        let unseenForTeacher = approved.filter((ae) => {
          if (ae.seen === true) return false
          const exam = examById.get(ae.exam_id)
          return exam && String(exam.teacher_id) === String(teacherId)
        })

        // Fallback: if no matches and there are unseen approvals, fetch exam details individually
        if (unseenForTeacher.length === 0) {
          const approvedUnseen = approved.filter((ae) => ae.seen !== true)
          if (approvedUnseen.length > 0) {
            const fetchedExams = await Promise.all(
              approvedUnseen.map((ae) =>
                getExamById(ae.exam_id).catch(() => null),
              ),
            )
            const fetchedMap = new Map<string | number, Exam>()
            approvedUnseen.forEach((ae, idx) => {
              const ex = fetchedExams[idx]
              if (ex) fetchedMap.set(ae.exam_id, ex)
            })
            unseenForTeacher = approvedUnseen.filter((ae) => {
              const exam = fetchedMap.get(ae.exam_id) || examById.get(ae.exam_id)
              return exam && String(exam.teacher_id) === String(teacherId)
            })
            // Merge into main map for title lookup
            fetchedMap.forEach((v, k) => examById.set(k, v))
          }
        }

        const items: NotificationItem[] = unseenForTeacher.map((ae) => {
          const exam = examById.get(ae.exam_id)
          const title = exam?.title || `Examen #${ae.exam_id}`
          const isRejected = ae.guidelines?.trim().startsWith("Rechazado")
          const base = isRejected
            ? `Tu examen "${title}" fue desaprobado`
            : `Tu examen "${title}" fue aprobado`
          const message = isRejected
            ? `${base} por el siguiente motivo: ${ae.guidelines}`
            : `${base}. Comentario del jefe de asignatura: ${ae.guidelines}`

          // Prefer backend-provided date value; ensure ISO string for path
          const rawDate = ae.date as any
          // Normalize to exact ISO format like 2025-12-08T06:11:45.095Z
          const dateValue = rawDate
            ? new Date(rawDate).toISOString()
            : null

          return {
            key: `${ae.exam_id}-${ae.head_teacher_id}-${String(dateValue)}`,
            examId: ae.exam_id,
            headTeacherId: ae.head_teacher_id,
            date: dateValue || '',
            title,
            guidelines: ae.guidelines,
            message,
          }
        })

        setNotifications(items)
        setLoading(false)

        // After showing, mark them as seen=true
        if (items.length > 0) {
          // Update seen=true only when we have a valid date to identify the record
          Promise.all(
            items.map(async (n) => {
              if (!n.date) {
                console.warn("Saltando updateApprovedExam por falta de fecha", n)
                return null
              }
              try {
                const res = await updateApprovedExam(
                  String(n.date),
                  String(n.examId),
                  String(n.headTeacherId),
                  { guidelines: n.guidelines, seen: true },
                )
                return res
              } catch (e) {
                console.error("Fallo al marcar seen=true", { n, error: e })
                return null
              }
            }),
          )
        }
      } catch (err: any) {
        console.error("Error cargando notificaciones:", err)
        setLoadError(err?.message || "Error al cargar notificaciones")
        setLoading(false)
      }
    }

    loadNotifications()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard — Profesor</h1>

      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-sm text-muted-foreground">Cargando notificaciones…</div>
          )}
          {!loading && loadError && (
            <div className="text-sm text-destructive">{loadError}</div>
          )}
          {!loading && !loadError && notifications.length === 0 && (
            <div className="text-sm text-muted-foreground">No hay nuevas notificaciones.</div>
          )}
          {!loading && !loadError && notifications.length > 0 && (
            <div className="space-y-4">
              {notifications.map((n) => (
                <div key={n.key} className="rounded-md border p-3 bg-muted/30">
                  <div className="font-medium">{n.title}</div>
                  <Separator className="my-2" />
                  <div className="text-sm">{n.message}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}