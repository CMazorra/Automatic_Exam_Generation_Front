"use client"

import { useEffect, useState } from "react"
import { ListViewWithAdd } from "@/components/list-view-with-add"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getTeachers } from "@/services/userService"

export default function SubjectPage() {
    const router = useRouter()
    const [entities, setEntities] = useState<any[]>([])
    useEffect(() => {
    getTeachers().then(setEntities).catch(console.error)
  }, [])
  return (
    <ListViewWithAdd
      title="Lista de Profesores"
      entities = {entities}
      sortFields={[
        { value: "name", label: "Nombre" },
        { value: "email", label: "Email" },
        { value: "age", label: "Edad" },
        { value: "specialty", label: "Especialidad"},
        { value: "year", label: "Curso" },
        { value: "date", label: "Fecha" },
      ]}
      filterFields={[
        { value: "name", label: "Nombre" },
        { value: "email", label: "Email" },
        { value: "age", label: "Edad" },
        { value: "specialty", label: "Especialidad"},
        { value: "year", label: "Curso" },
        { value: "date", label: "Fecha" },
      ]}
      renderEntity={(user) => (
        <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-card-foreground">{user.name}</h3>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Especialidad: ${user.specialty}</span>
                <span>Curso: ${user.year}</span>
                <span>Fecha: {user.date}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/admin/user/${user.id}`)}>
              Ver detalles
            </Button>
          </div>
        </div>
      )}
      onAdd={() => router.push("/dashboard/admin/user/new")}
    />
  )
}