"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldGroup, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { postUser } from "@/services/userService"

// ✅ Use the exact role union expected by backend + service
type Role = "ADMIN" | "TEACHER" | "STUDENT"

const roles: { value: Role; label: string }[] = [
  { value: "ADMIN", label: "Administrador" },
  { value: "TEACHER", label: "Profesor" },
  { value: "STUDENT", label: "Estudiante" },
]

export default function NewUserPage() {
  const [name, setName] = useState("")
  const [account, setAccount] = useState("")
  const [age, setAge] = useState<number | "">("")
  const [course, setCourse] = useState("")
  const [role, setRole] = useState<Role | "">("") // ✅ fixed typing
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim() || !account.trim() || !role) return

    setIsLoading(true)
    try {
      await postUser({
        name: name.trim(),
        account: account.trim(),
        age: age ? Number(age) : undefined,
        course: course.trim() || undefined,
        role, // ✅ already a Role type
      })
      router.push("/dashboard/admin/user")
      setName("")
      setAccount("")
      setAge("")
      setCourse("")
      setRole("")
    } catch (err) {
      console.error(err)
      alert("Hubo un error al crear el usuario.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <div>
            <h2 className="font-semibold leading-none">Nuevo Usuario</h2>
          </div>

          <FieldGroup>
            <FieldSet>
              <Field>
                <FieldLabel htmlFor="name">Nombre</FieldLabel>
                <Input
                  id="name"
                  placeholder="Nombre del usuario"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="account">Cuenta</FieldLabel>
                <Input
                  id="account"
                  placeholder="Correo o identificador"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="age">Edad</FieldLabel>
                <Input
                  id="age"
                  type="number"
                  placeholder="Edad del usuario"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="course">Curso</FieldLabel>
                <Input
                  id="course"
                  placeholder="Curso o grupo"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="role">Rol</FieldLabel>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)} // ✅ type cast here
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Selecciona un rol</option>
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </Field>
            </FieldSet>
          </FieldGroup>

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading || !name.trim() || !account.trim() || !role}>
              {isLoading ? "Creando..." : "Crear Usuario"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/admin/user")}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </main>
  )
}
