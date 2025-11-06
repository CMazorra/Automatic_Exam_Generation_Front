// page.tsx - Gestión de usuarios
// Esta vista permite listar, crear y editar usuarios usando react-hook-form y zod.
// Se conecta con userService.ts y explica cada paso con comentarios educativos.

"use client"

import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "@/services/userService"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

// Definimos el esquema de validación con Zod
const userSchema = z.object({
  name: z.string().min(3, "El nombre es obligatorio"),
  email: z.string().email("Email inválido"),
  role: z.string().min(1, "Rol requerido"),
})

// Tipo para un usuario
interface User extends z.infer<typeof userSchema> {
  id: string | number
}

export default function UserPage() {
  // Estado para la lista de usuarios
  const [users, setUsers] = useState<User[]>([])
  // Estado para modo edición
  const [editing, setEditing] = useState<User | null>(null)
  // Estado para mensajes de éxito/error
  const [message, setMessage] = useState<string>("")

  // Formulario con react-hook-form y zod
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", role: "" },
  })

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers()
  }, [])

  // Función para obtener usuarios desde la API
  async function fetchUsers() {
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (err) {
      setMessage("Error al cargar usuarios")
      console.error(err)
    }
  }

  // Crear o actualizar usuario
  async function onSubmit(values: z.infer<typeof userSchema>) {
    try {
      if (editing) {
        // Actualizar usuario existente
        await updateUser(editing.id, values)
        setMessage("Usuario actualizado correctamente")
      } else {
        // Crear nuevo usuario
        await createUser(values)
        setMessage("Usuario creado correctamente")
      }
      form.reset()
      setEditing(null)
      fetchUsers()
    } catch (err) {
      setMessage("Error al guardar usuario")
      console.error(err)
    }
  }

  // Eliminar usuario
  async function handleDelete(id: string | number) {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return
    try {
      await deleteUser(id)
      setMessage("Usuario eliminado correctamente")
      fetchUsers()
    } catch (err) {
      setMessage("Error al eliminar usuario")
      console.error(err)
    }
  }

  // Iniciar edición
  function handleEdit(u: User) {
    setEditing(u)
    form.reset({ name: u.name, email: u.email, role: u.role })
  }

  // Cancelar edición
  function handleCancelEdit() {
    setEditing(null)
    form.reset()
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>
      <p className="mb-2 text-muted-foreground">
        Aquí puedes ver, crear y editar usuarios. Cada acción se conecta con la API usando fetch.
      </p>
      {message && <div className="mb-4 text-sm text-blue-600">{message}</div>}

      {/* Formulario para crear/editar usuario */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-8 p-4 border rounded-lg">
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
          <div className="flex gap-2">
            <Button type="submit">{editing ? "Actualizar" : "Crear"} Usuario</Button>
            {editing && <Button type="button" variant="outline" onClick={handleCancelEdit}>Cancelar</Button>}
          </div>
        </form>
      </Form>

      {/* Tabla/lista de usuarios */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Lista de Usuarios</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Rol</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(u)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(u.id)}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="p-2 text-center text-muted-foreground">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Comentarios educativos */}
      <div className="mt-8 p-4 bg-muted rounded-lg text-xs text-muted-foreground">
        {/*
          - Cada acción (crear, editar, eliminar) llama a la API usando fetch y actualiza la interfaz.
          - La validación de formularios se realiza con Zod y react-hook-form.
          - Los datos se muestran en una tabla y se actualizan en tiempo real.
          - Los errores se manejan con try/catch y se muestran mensajes claros.
        */}
      </div>
    </div>
  )
}
