"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ListViewWithAdd } from "@/components/list-view-with-add"
import { Button } from "@/components/ui/button"
import { getUsers } from "@/services/userService"

export default function UserPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers()
        // Aseguramos que todos tengan id_us
        const mapped = data.map((u: any) => ({
          ...u,
          id_us: u.id_us ?? u.id ?? u._id,
        }))
        setUsers(mapped)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUsers()
  }, [])

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">Cargando usuarios...</div>
      </main>
    )
  }

  return (
    <ListViewWithAdd
      title="Lista de Usuarios"
      entities={users}
      sortFields={[{ value: "name", label: "Nombre" }]}
      filterFields={[{ value: "name", label: "Nombre" }]}
      getEntityKey={(u) => `${u.id_us}`}
      renderEntity={(user) => (
        <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-card-foreground">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.account}</p>
              </div>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/admin/user/${user.id_us}`)}
            >
              Ver detalles
            </Button>
          </div>
        </div>
      )}
      onAdd={() => router.push("/dashboard/admin/user/new")}
    />
  )
}
