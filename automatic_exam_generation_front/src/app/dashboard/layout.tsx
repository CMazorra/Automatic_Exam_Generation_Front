"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getCurrentUser } from "@/services/authService"
import { getTeacherByID } from "@/services/teacherService"
import { getStudentByID } from "@/services/studentService"

interface User {
  id?: string | number
  name?: string
  account?: string
  email?: string
  role?: string
  phone?: string
  age?: number
  course?: string
  is_head_teacher?: boolean
  headTeacher?: boolean
  [key: string]: any
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User>({ account: "Usuario" })

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUserData = await getCurrentUser()
        console.log("Datos del usuario (getCurrentUser):", currentUserData)
        
        // Obtener detalles completos usando el ID, según rol
        if (currentUserData?.id) {
          const userId = currentUserData.id
          const role = String(currentUserData?.role ?? "").toLowerCase()
          let detailed: any = null
          try {
            if (role === "teacher" || currentUserData?.is_head_teacher || currentUserData?.headTeacher) {
              detailed = await getTeacherByID(userId)
            } else if (role === "student") {
              detailed = await getStudentByID(userId)
            }
          } catch (e) {
            console.warn("No se pudo obtener detalles por rol, usando datos actuales", e)
          }
          const headTeacherFlag = currentUserData?.headTeacher ?? currentUserData?.is_head_teacher
          const merged = typeof headTeacherFlag !== "undefined"
            ? { ...(detailed || {}), headTeacher: headTeacherFlag, is_head_teacher: headTeacherFlag }
            : (detailed || {})

          // Normaliza campos planos para que el UI los muestre correctamente
          const base: any = Object.keys(merged).length ? merged : (currentUserData || {})
          const normalized: any = {
            ...base,
            id: base.id ?? base.user?.id ?? base.user?.id_us,
            name: base.name ?? base.user?.name ?? base.teacher?.user?.name,
            account: base.account ?? base.user?.account,
            email: base.email ?? base.user?.email,
            role: (base.role ?? base.user?.role ?? currentUserData?.role) as string | undefined,
            age: base.age ?? base.user?.age,
            course: base.course ?? base.user?.course,
            phone: base.phone ?? base.user?.phone,
          }
          setUser(Object.keys(normalized).length ? normalized : { account: "Usuario" })
        } else {
          setUser(currentUserData || { account: "Usuario" })
        }
      } catch (error) {
        console.error("Error al cargar los datos del usuario:", error)
        setUser({ account: "Usuario" })
      }
    }
    loadUserData()
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

            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 rounded-full px-3 py-1 bg-muted text-muted-foreground hover:bg-muted/80" aria-label="profile menu">
                  <span className="w-8 h-8 rounded-full bg-primary inline-block" />
                  <span className="text-sm">{user.name || user.account || "Usuario"}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Detalles de Perfil</h4>
                  </div>
                  <div className="space-y-3">
                    {(user.name || user.account) && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Nombre</p>
                        <p className="text-sm">{user.name || user.account}</p>
                      </div>
                    )}
                    {user.account && !user.name && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Usuario</p>
                        <p className="text-sm">{user.account}</p>
                      </div>
                    )}
                    {user.email && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Correo</p>
                        <p className="text-sm">{user.email}</p>
                      </div>
                    )}
                    {user.role && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Rol</p>
                        <p className="text-sm">{
                          (user.is_head_teacher || user.headTeacher)
                            ? "Head Teacher"
                            : (user.role?.toUpperCase() === "TEACHER" ? "Teacher" : user.role)
                        }</p>
                      </div>
                    )}
                    {user.age && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Edad</p>
                        <p className="text-sm">{user.age}</p>
                      </div>
                    )}
                    {user.course && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Curso</p>
                        <p className="text-sm">{user.course}</p>
                      </div>
                    )}
                    {user.phone && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Teléfono</p>
                        <p className="text-sm">{user.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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