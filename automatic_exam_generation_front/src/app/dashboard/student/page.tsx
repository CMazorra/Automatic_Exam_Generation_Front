"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function StudentDashboardPage() {
  const router = useRouter()

  const mockSummary = {
    nextExam: { id: "e1", title: "Parcial 1", date: "2025-11-01" },
    avgGrade: 8.4,
  }

  const mockExams = [
    { id: "e1", title: "Parcial 1", date: "2025-11-01" },
    { id: "e3", title: "Recuperatorio", date: "2025-12-05" },
  ]

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard — Estudiante</h1>
        <div className="text-sm text-muted-foreground">Cuenta: Estudiante</div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tu próximo examen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium">{mockSummary.nextExam.title}</div>
            <div className="text-sm text-muted-foreground">{mockSummary.nextExam.date}</div>
            <div className="mt-3">
              <Button onClick={() => router.push(`/dashboard/student/exams/view/${mockSummary.nextExam.id}`)}>Ver</Button>
              <Button className="ml-2" onClick={() => router.push(`/dashboard/student/exams/start/${mockSummary.nextExam.id}`)}>Iniciar</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calificación promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockSummary.avgGrade}</div>
            <div className="text-sm text-muted-foreground mt-2">Promedio de todas tus evaluaciones</div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Próximos exámenes</h2>
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
                    <Button onClick={() => router.push(`/dashboard/student/exams/view/${e.id}`)}>Ver</Button>
                    <Button onClick={() => router.push(`/dashboard/student/exams/start/${e.id}`)}>Iniciar</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Detalles rápidos del examen.</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}