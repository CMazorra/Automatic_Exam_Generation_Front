"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function StudentDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard — Estudiante</h1>

      <Card>
        <CardHeader>
          <CardTitle>Visión general</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Seleccione una opción del menú de la izquierda para ver sus exámenes, resultados y configuraciones.</p>

          <div className="text-sm text-muted-foreground">Acciones específicas disponibles en la sección correspondiente (Exámenes / Resultados).</div>
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