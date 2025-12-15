"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldGroup, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { getUserById, updateUser } from "@/services/userService"

type Role = "ADMIN" | "TEACHER" | "STUDENT"

interface User {
  id: string
  name: string
  account: string
  age?: number
  course?: string
  role: Role
}

export default function UserEdit({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState("")
  const [account, setAccount] = useState("")
  const [age, setAge] = useState<number | undefined>()
  const [course, setCourse] = useState("")
  const [role, setRole] = useState<Role | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  // 🔹 Fetch user data on load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserById(params.id)
        setUser(data)
        setName(data.name)
        setAccount(data.account)
        setAge(data.age)
        setCourse(data.course)
        setRole(data.role as Role)
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [params.id])

  // 🔹 Handle save/update
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim() || !account.trim() || !role) return

    setIsSaving(true)
    try {
      await updateUser(params.id, { name, account, age, course, role })
      router.push(`/dashboard/admin/user/${params.id}`)
    } catch (error) {
      console.error("Error updating user:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // 🔹 Loading screen
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">Cargando...</div>
      </main>
    )
  }

  // 🔹 Not found
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center text-destructive">Usuario no encontrado</div>
      </main>
    )
  }

  // 🔹 Main form
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold">Editar Usuario</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
              <FieldSet>
                <Field>
                  <FieldLabel htmlFor="name">Nombre</FieldLabel>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre del usuario"
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="account">Cuenta</FieldLabel>
                  <Input
                    id="account"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder="Usuario o correo"
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="age">Edad</FieldLabel>
                  <Input
                    id="age"
                    type="number"
                    value={age ?? ""}
                    onChange={(e) => setAge(Number(e.target.value))}
                    placeholder="Edad"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="course">Curso</FieldLabel>
                  <Input
                    id="course"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="Curso o carrera"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="role">Rol</FieldLabel>
                  <select
                    id="role"
                    value={role || ""}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Seleccionar rol</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="TEACHER">Profesor</option>
                    <option value="STUDENT">Estudiante</option>
                  </select>
                </Field>
              </FieldSet>
            </FieldGroup>

            <div className="flex gap-3">
              <Link href={`/dashboard/admin/user/${params.id}`}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={isSaving || !name.trim() || !account.trim() || !role}>
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
