"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldGroup, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { postUser } from "@/services/userService"
import { toast } from "sonner"

type Role = "ADMIN" | "TEACHER" | "STUDENT"

const roles: { value: Role; label: string }[] = [
  { value: "ADMIN", label: "Administrador" },
  { value: "TEACHER", label: "Profesor" },
  { value: "STUDENT", label: "Estudiante" },
]

export default function NewUserPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: "",
    account: "",
    password: "",
    age: "",
    course: "",
    role: "" as Role | "",
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target
    setForm((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name.trim() || !form.account.trim() || !form.role) {
      toast.warning("Faltan campos obligatorios", {
        description: "Nombre, Cuenta y Rol son obligatorios.",
      })
      return
    }

    setIsLoading(true)
    try {
      await postUser({
        name: form.name.trim(),
        account: form.account.trim(),
        password: form.password || "default123",
        age: form.age ? Number(form.age) : undefined,
        course: form.course.trim() || undefined,
        role: form.role,
      })

      toast.success("Usuario creado", {
        description: `El usuario "${form.name}" fue creado correctamente.`,
      })

      router.push("/dashboard/admin/user")
    } catch (err: any) {
      console.error(err)
      toast.error("Error al crear usuario", {
        description: err?.message || "No se pudo crear el usuario.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Nuevo Usuario</h2>

          <FieldGroup>
            <FieldSet>
              <Field>
                <FieldLabel htmlFor="name">Nombre</FieldLabel>
                <Input
                  id="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="account">Cuenta</FieldLabel>
                <Input
                  id="account"
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
                  value={form.password}
                  onChange={handleChange}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="age">Edad</FieldLabel>
                <Input
                  id="age"
                  type="number"
                  value={form.age}
                  onChange={handleChange}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="course">Curso</FieldLabel>
                <Input
                  id="course"
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
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
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
