// page.tsx - Crear nuevo usuario (solo admin)
// Esta vista permite al administrador crear usuarios usando react-hook-form y zod.
// Se conecta con userService.ts y explica cada paso con comentarios educativos.

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { createUser } from "@/services/userService"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useState } from "react"

// Esquema de validación con Zod
const userSchema = z.object({
  name: z.string().min(3, "El nombre es obligatorio"),
  email: z.string().email("Email inválido"),
  role: z.string().min(1, "Rol requerido"),
})

export default function CreateUserPage() {
  const router = useRouter()
  const [message, setMessage] = useState<string>("")

  // Formulario con react-hook-form y zod
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", role: "" },
  })

  // Crear usuario
  async function onSubmit(values: z.infer<typeof userSchema>) {
    try {
      await createUser(values)
      setMessage("Usuario creado correctamente")
      form.reset()
      // Redirige a la lista de usuarios
      setTimeout(() => router.push("/dashboard/admin/user"), 1000)
    } catch (err) {
      setMessage("Error al crear usuario")
      console.error(err)
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Crear Nuevo Usuario</h1>
      <p className="mb-2 text-muted-foreground">
        Solo el administrador puede crear usuarios. El formulario valida los datos antes de enviarlos a la API.
      </p>
      {message && <div className="mb-4 text-sm text-blue-600">{message}</div>}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del usuario" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email del usuario" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Administrador, Profesor, Estudiante" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Crear Usuario</Button>
        </form>
      </Form>

      {/* Comentarios educativos */}
      <div className="mt-8 p-4 bg-muted rounded-lg text-xs text-muted-foreground">
        {/*
          - Solo el admin puede crear usuarios.
          - La validación de formularios se realiza con Zod y react-hook-form.
          - Los datos se envían a la API usando fetch.
          - Se redirige a la lista de usuarios tras crear uno nuevo.
        */}
      </div>
    </div>
  )
}
