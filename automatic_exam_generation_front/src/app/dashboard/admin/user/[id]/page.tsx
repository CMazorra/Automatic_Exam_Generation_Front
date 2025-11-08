"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getUserById, deleteUser } from "@/services/userService"

// Define interface based on backend DTO
interface User {
  id: string
  name: string
  account: string
  age?: number
  course?: string
  role: "ADMIN" | "TEACHER" | "STUDENT"
}

export default function UserView({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserById(params.id)
        setUser(data)
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [params.id])

  // --- Loading state ---
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">Cargando...</div>
      </main>
    )
  }

  // --- Not found ---
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center text-destructive">Usuario no encontrado</div>
      </main>
    )
  }

  // --- Main content ---
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <div>
            <h2 className="font-semibold leading-none">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.account}</p>
          </div>

          <div className="space-y-2">
            {user.age && <p><strong>Edad:</strong> {user.age}</p>}
            {user.course && <p><strong>Curso:</strong> {user.course}</p>}
            <p><strong>Rol:</strong> {user.role}</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Link href="/dashboard/admin/user">
              <Button variant="outline">Volver</Button>
            </Link>
            <Link href={`/dashboard/admin/user/${user.id}/edit`}>
              <Button>Editar</Button>
            </Link>
            <Button
              variant="destructive"
              onClick={async () => {
                const confirmDelete = confirm(
                  `¿Seguro que deseas eliminar al usuario "${user.name}"?`
                )
                if (!confirmDelete) return

                try {
                  await deleteUser(user.id)
                  router.push("/dashboard/admin/user")
                } catch (error) {
                  console.error("Error deleting user:", error)
                  alert("Hubo un error al eliminar el usuario.")
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
