"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard — Administrador</h1>

      <Card>
        <CardHeader>
          <CardTitle>Visión general</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Seleccione una opción del menú de la izquierda para gestionar profesores, estudiantes, asignaturas, exámenes y más.</p>

          {/* Botones específicos movidos: se muestran sólo en sus secciones */}
          <div className="text-sm text-muted-foreground">Acciones específicas disponibles en la sección correspondiente (Profesores / Estudiantes / Exámenes).</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actividad reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No hay actividad real aún — este es un espacio preparado para widgets.</div>
        </CardContent>
      </Card>
    </div>
  )
}