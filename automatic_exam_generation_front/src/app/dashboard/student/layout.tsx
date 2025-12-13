"use client"

import React from "react"
import Link from "next/link"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full">
      <aside className="w-64 border-r bg-sidebar p-4 text-sidebar-foreground">
        <h2 className="text-lg font-semibold mb-4">Panel — Estudiante</h2>

        <nav className="flex flex-col gap-2 text-sm">
          <Link href="/dashboard/student/teachers" className="block">
            <span className="inline-block w-full text-left px-3 py-2 rounded-md bg-card border hover:bg-primary/10">Profesores</span>
          </Link>

          <Link href="/dashboard/student/subject" className="block">
            <span className="inline-block w-full text-left px-3 py-2 rounded-md bg-card border hover:bg-primary/10">Asignaturas</span>
          </Link>          

          <Link href="/dashboard/student/exam_to_do" className="block">
            <span className="inline-block w-full text-left px-3 py-2 rounded-md bg-card border hover:bg-primary/10">Examenes a realizar</span>
          </Link>
          
          <Link href="/dashboard/student/exam_done" className="block">
            <span className="inline-block w-full text-left px-3 py-2 rounded-md bg-card border hover:bg-primary/10">Examenes hechos</span>
          </Link>
        </nav>
      </aside>

      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  )
}