"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCurrentUser } from "@/services/authService"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string>("Usuario")

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const user = await getCurrentUser()
        setUserRole(user.role || "Usuario")
      } catch (error) {
        console.error("Error al cargar el rol del usuario:", error)
        setUserRole("Usuario")
      }
    }
    loadUserRole()
  }, [])

  const openNotifications = () => {
    alert("Notificaciones (panel pendiente)")
  }

  const handleLogout = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL ?? ""}/auth/logout`
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
      })
      if (!res.ok) {
        console.error("Logout failed", res.status)
      }
    } catch (err) {
      console.error("Error logout:", err)
    } finally {
      if (typeof document !== "undefined") {
        document.cookie = "aeg_role=; Path=/; Max-Age=0; SameSite=Lax"
        document.cookie = "aeg_head=; Path=/; Max-Age=0; SameSite=Lax"
      }
      router.push("/auth/login")
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full bg-card border-b px-2 py-2">
        <div className="w-full relative flex items-center">
          <div className="flex-shrink-0 flex items-center gap-2">
            <button onClick={() => router.push("/")} aria-label="home" className="p-0 bg-transparent border-0 flex items-center">
              <Image src="/logo.jpg" alt="Logo" width={120} height={48} className="rounded-md" />
            </button>

            <Button onClick={() => router.push("/")} className="px-6 py-5 rounded-md">
              Home
            </Button>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-xl px-4">
            <Input placeholder="Search" />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button onClick={openNotifications} aria-label="notificaciones" className="inline-flex items-center justify-center rounded-md px-3 py-2 bg-muted text-muted-foreground hover:bg-muted/80">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            <Button onClick={handleLogout} className="px-3 py-2 rounded-md">
              Cerrar sesión
            </Button>

            <div className="relative">
              <button className="flex items-center gap-2 rounded-full px-3 py-1 bg-muted text-muted-foreground hover:bg-muted/80" aria-label="profile menu">
                <span className="w-8 h-8 rounded-full bg-primary inline-block" />
                <span className="text-sm">{userRole}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main: children ocupará todo el ancho; sub-layouts insertarán su sidebar si corresponde */}
      <div className="flex flex-1">
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}