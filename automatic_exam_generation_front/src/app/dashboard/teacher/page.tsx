"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function TeacherDashboardPage() {
  const router = useRouter()

  const mockStats = {
    examsToGrade: 4,
    activeStudents: 128,
    upcoming: 2,
  }

  const mockExams = [
    { id: "e1", title: "Parcial 1", date: "2025-11-01" },
    { id: "e2", title: "Quiz Tema 3", date: "2025-11-10" },
  ]

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard — Profesor</h1>
        <div className="text-sm text-muted-foreground">Cuenta: Profesor</div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Exámenes por corregir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockStats.examsToGrade}</div>
            <div className="text-sm text-muted-foreground mt-2">Exámenes pendientes de corrección</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estudiantes activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockStats.activeStudents}</div>
            <div className="text-sm text-muted-foreground mt-2">Inscritos en tus asignaturas</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockStats.upcoming}</div>
            <div className="text-sm text-muted-foreground mt-2">Exámenes próximos</div>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Exámenes</h2>
          <Button onClick={() => router.push("/dashboard/teacher/exams/create")}>Crear examen</Button>
        </div>

        <div className="space-y-3">
          {mockExams.map((e) => (
            <Card key={e.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{e.title}</div>
                    <div className="text-sm text-muted-foreground">{e.date}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => router.push(`/dashboard/teacher/exams/edit/${e.id}`)}>Editar</Button>
                    <Button onClick={() => router.push(`/dashboard/teacher/exams/assign/${e.id}`)}>Asignar</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Resumen rápido del examen o notas.</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}