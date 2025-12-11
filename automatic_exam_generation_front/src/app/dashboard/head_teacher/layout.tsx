"use client"

import React from "react"
import Link from "next/link"

export default function HeadTeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full">
      <aside className="w-64 border-r bg-sidebar p-4 text-sidebar-foreground">
        <h2 className="text-lg font-semibold mb-4">Panel — Jefe de Departamento</h2>

        <nav className="flex flex-col gap-2 text-sm">
          <Link href="/dashboard/head_teacher/teachers" className="block">
            <span className="inline-block w-full text-left px-3 py-2 rounded-md bg-card border hover:bg-primary/10">Compañeros</span>
          </Link>

          <Link href="/dashboard/head_teacher/students" className="block">
            <span className="inline-block w-full text-left px-3 py-2 rounded-md bg-card border hover:bg-primary/10">Estudiantes</span>
          </Link>

          <Link href="/dashboard/head_teacher/exam_to_validate" className="block">
            <span className="inline-block w-full text-left px-3 py-2 rounded-md bg-card border hover:bg-primary/10">Exámenes a validar</span>
          </Link>

          <Link href="/dashboard/head_teacher/exam_to_review" className="block">
            <span className="inline-block w-full text-left px-3 py-2 rounded-md bg-card border hover:bg-primary/10">Exámenes a calificar</span>
          </Link>

          <Link href="/dashboard/head_teacher/exam" className="block">
            <span className="inline-block w-full text-left px-3 py-2 rounded-md bg-card border hover:bg-primary/10">Exámenes</span>
          </Link>


          <Link href="/dashboard/head_teacher/subject" className="block">
            <span className="inline-block w-full text-left px-3 py-2 rounded-md bg-card border hover:bg-primary/10">Asignaturas</span>
          </Link>

          <Link href="/dashboard/head_teacher/question" className="block">
            <span className="inline-block w-full text-left px-3 py-2 rounded-md bg-card border hover:bg-primary/10">Preguntas</span>
          </Link>

          <Link href="/dashboard/head_teacher/params" className="block">
            <span className="inline-block w-full text-left px-3 py-2 rounded-md bg-card border hover:bg-primary/10">Parametrizaciones</span>
          </Link>

          <Link href="/dashboard/head_teacher/reports" className="block">
            <span className="inline-block w-full text-left px-3 py-2 rounded-md bg-card border hover:bg-primary/10">Reportes</span>
          </Link>
        </nav>
      </aside>

      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  )
}