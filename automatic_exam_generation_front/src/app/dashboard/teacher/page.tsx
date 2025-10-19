"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function TeacherDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard — Profesor</h1>

      <Card>
        <CardHeader>
          <CardTitle>Visión general</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Seleccione una opción del menú de la izquierda para gestionar sus exámenes, preguntas y configuraciones.</p>

          <div className="text-sm text-muted-foreground">Acciones específicas disponibles en la sección correspondiente (Exámenes / Preguntas).</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actividad reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No hay actividad reciente.</div>
        </CardContent>
      </Card>
    </div>
  )
}