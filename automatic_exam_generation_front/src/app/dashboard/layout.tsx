"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const openNotifications = () => {
    // placeholder: abrir panel de notificaciones
    alert("Notificaciones (panel pendiente)")
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full bg-card border-b px-2 py-2">
        <div className="max-w-7xl mx-auto relative flex items-center">
          {/* Home: botón más pegado a la esquina izquierda */}
          <div className="flex-shrink-0">
            <Button onClick={() => router.push("/")} className="px-3 py-2">
              Home
            </Button>
          </div>

          {/* Search: centrado */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-xl px-4">
            <Input placeholder="Search" />
          </div>

          {/* Right area: notificaciones + perfil, pegado a la esquina derecha */}
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={openNotifications}
              aria-label="notificaciones"
              className="inline-flex items-center justify-center rounded-md px-3 py-2 bg-muted text-muted-foreground hover:bg-muted/80"
            >
              {/* simple icono de campana */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            <div className="relative">
              <button
                className="flex items-center gap-2 rounded-full px-3 py-1 bg-muted text-muted-foreground hover:bg-muted/80"
                aria-label="profile menu"
              >
                <span className="w-8 h-8 rounded-full bg-primary inline-block" />
                <span className="text-sm">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content with sidebar */}
      <div className="flex flex-1">
        <aside className="w-64 border-r bg-sidebar p-4 text-sidebar-foreground">
          <h2 className="text-lg font-semibold mb-4">Panel</h2>

          <nav className="flex flex-col gap-2 text-sm">
            {/* Items del menú como botones con fondo/borde/hover */}
            <Link href="/dashboard/admin" className="block">
              <span className="inline-block w-full text-left px-3 py-2 rounded-md bg-card border hover:bg-primary/10">Profesores</span>
            </Link>

            <Link href="/dashboard/teacher" className="block">
              <span className="inline-block w-full text-left px-3 py-2 rounded-md bg-card border hover:bg-primary/10">Estudiantes</span>
            </Link>

            <details className="group">
              <summary className="flex items-center justify-between px-3 py-2 rounded-md bg-card border cursor-pointer hover:bg-primary/10">
                <span>Asignaturas</span>
                <span className="ml-2">▾</span>
              </summary>
              <div className="pl-3 mt-2 flex flex-col gap-1">
                <Link href="/dashboard/admin/subject" className="text-sm">
                  <span className="inline-block px-2 py-1 rounded hover:bg-sidebar-accent/10">Listado</span>
                </Link>
                <Link href="/dashboard/admin/subjects/new" className="text-sm">
                  <span className="inline-block px-2 py-1 rounded hover:bg-sidebar-accent/10">Crear</span>
                </Link>
              </div>
            </details>

            <Link href="/dashboard/admin/exams" className="block">
              <span className="inline-block w-full text-left px-3 py-2 rounded-md bg-card border hover:bg-primary/10">Exámenes</span>
            </Link>

            <Link href="/dashboard/admin/questions" className="block">
              <span className="inline-block w-full text-left px-3 py-2 rounded-md bg-card border hover:bg-primary/10">Preguntas</span>
            </Link>

            <Link href="/dashboard/admin/publications" className="block">
              <span className="inline-block w-full text-left px-3 py-2 rounded-md bg-card border hover:bg-primary/10">Publicaciones</span>
            </Link>

            <Link href="/dashboard/admin/reports" className="block">
              <span className="inline-block w-full text-left px-3 py-2 rounded-md bg-card border hover:bg-primary/10">Reportes</span>
            </Link>


          </nav>

          <div className="mt-6">
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">Tip</div>
              <div className="text-sm">Seleccione una opción del menú.</div>
            </Card>
          </div>
        </aside>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}