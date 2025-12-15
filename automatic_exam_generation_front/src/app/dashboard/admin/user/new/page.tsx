"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldGroup, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { postUser } from "@/services/userService"

type Role = "ADMIN" | "TEACHER" | "STUDENT"

const roles: { value: Role; label: string }[] = [
  { value: "ADMIN", label: "Administrador" },
  { value: "TEACHER", label: "Profesor" },
  { value: "STUDENT", label: "Estudiante" },
]

export default function NewUserPage() {
  const [form, setForm] = useState({
    name: "",
    account: "",
    password: "",
    age: "",
    course: "",
    role: "" as Role | "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setForm((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.account.trim() || !form.role) {
      alert("Por favor, completa los campos obligatorios.")
      return
    }

    setIsLoading(true)
    try {
      await postUser({
        name: form.name.trim(),
        account: form.account.trim(),
        password: form.password || "default123", // 🔹 si el backend lo requiere
        age: form.age ? Number(form.age) : undefined,
        course: form.course.trim() || undefined,
        role: form.role,
      })
      alert("✅ Usuario creado correctamente.")
      router.push("/dashboard/admin/user")
    } catch (err) {
      console.error(err)
      alert("❌ Hubo un error al crear el usuario.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <div>
            <h2 className="font-semibold leading-none text-xl">Nuevo Usuario</h2>
          </div>

          <FieldGroup>
            <FieldSet>
              <Field>
                <FieldLabel htmlFor="name">Nombre</FieldLabel>
                <Input
                  id="name"
                  placeholder="Nombre del usuario"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="account">Cuenta</FieldLabel>
                <Input
                  id="account"
                  placeholder="Correo o identificador"
                  value={form.account}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Contraseña del usuario"
                  value={form.password}
                  onChange={handleChange}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="age">Edad</FieldLabel>
                <Input
                  id="age"
                  type="number"
                  placeholder="Edad del usuario"
                  value={form.age}
                  onChange={handleChange}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="course">Curso</FieldLabel>
                <Input
                  id="course"
                  placeholder="Curso o grupo"
                  value={form.course}
                  onChange={handleChange}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="role">Rol</FieldLabel>
                <select
                  id="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
            <Button type="submit" disabled={isLoading}>
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
