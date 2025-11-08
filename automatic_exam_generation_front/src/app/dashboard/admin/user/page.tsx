"use client"

import { useEffect, useState } from "react"
import { ListViewWithAdd } from "@/components/list-view-with-add"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getUsers } from "@/services/userService"

export default function UserPage() {
  const router = useRouter()
  const [entities, setEntities] = useState<any[]>([])

  useEffect(() => {
    getUsers().then(setEntities).catch(console.error)
  }, [])

  return (
    <ListViewWithAdd
      title="Lista de Usuarios"
      entities={entities}
      sortFields={[
        { value: "name", label: "Nombre" },
      ]}
      filterFields={[
        { value: "name", label: "Nombre" },
      ]}
      getEntityKey={(u) => `${u.id}`}
      renderEntity={(user) => (
        <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-card-foreground">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.account}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/admin/user/${user.id}`)}
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
