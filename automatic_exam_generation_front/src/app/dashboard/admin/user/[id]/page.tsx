"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter, useParams } from "next/navigation"
import { getUserById, deleteUser } from "@/services/userService"
import { toast } from "sonner"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"

export default function UserView() {
  const params = useParams()
  const id = params?.id as string
  const [user, setUser] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!id) return
    const fetchUser = async () => {
      try {
        const data = await getUserById(id)
        setUser({ ...data, id_us: data.id_us ?? data.id ?? data._id })
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [id])

  const handleDelete = async () => {
    if (!user || isDeleting) return

    setIsDeleting(true)
    try {
      await deleteUser(user.id_us)

      toast.success("Usuario eliminado", {
        description: `El usuario "${user.name}" ha sido eliminado correctamente.`,
      })

      router.push("/dashboard/admin/user")
    } catch (error: any) {
      console.error("Error deleting user:", error)
      toast.error("Error al eliminar", {
        description: error?.message || "No se pudo eliminar el usuario.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">Cargando...</div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center text-destructive">Usuario no encontrado</div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <div>
            <h2 className="font-semibold leading-none">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.account}</p>
          </div>

          <div className="space-y-2">
            {user.age && (
              <p>
                <strong>Edad:</strong> {user.age}
              </p>
            )}
            {user.course && (
              <p>
                <strong>Curso:</strong> {user.course}
              </p>
            )}
            <p>
              <strong>Rol:</strong> {user.role}</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Link href="/dashboard/admin/user">
              <Button variant="outline">Volver</Button>
            </Link>

            <Button
              onClick={() =>
                router.push(`/dashboard/admin/user/${user.id_us}/edit`)
              }
            >
              Editar
            </Button>

            <ConfirmDeleteDialog
            title={`Eliminar usuario "${user.name}"`}
            description="¿Estás seguro de que deseas eliminar este usuario? Esta acción es irreversible."
            onConfirm={handleDelete}
          >
            <Button variant="destructive" disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </ConfirmDeleteDialog>
          </div>
        </div>
      </div>
    </main>
  )
}
