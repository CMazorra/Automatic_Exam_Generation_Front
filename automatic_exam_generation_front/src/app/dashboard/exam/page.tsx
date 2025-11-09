// page.tsx - Gestión de exámenes
// Esta vista permite listar, crear y editar exámenes usando react-hook-form y zod.
// Se conecta con examService.ts y explica cada paso con comentarios educativos.

"use client"

import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  getExams,
  createExam,
  updateExam,
  deleteExam,
} from "@/services/examService"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

// Definimos el esquema de validación con Zod
const examSchema = z.object({
  name: z.string().min(3, "El nombre es obligatorio"),
  subject: z.string().min(1, "Materia requerida"),
  duration: z.string().min(1, "Duración requerida"),
  date: z.string().min(1, "Fecha requerida"),
  creator: z.string().min(1, "Creador requerido"),
})

// Tipo para un examen
interface Exam extends z.infer<typeof examSchema> {
  id: string | number
}

export default function ExamPage() {
  // Estado para la lista de exámenes
  const [exams, setExams] = useState<Exam[]>([])
  // Estado para modo edición
  const [editing, setEditing] = useState<Exam | null>(null)
  // Estado para mensajes de éxito/error
  const [message, setMessage] = useState<string>("")

  // Formulario con react-hook-form y zod
  const form = useForm<z.infer<typeof examSchema>>({
    resolver: zodResolver(examSchema),
    defaultValues: { name: "", subject: "", duration: "", date: "", creator: "" },
  })

  // Cargar exámenes al montar el componente
  useEffect(() => {
    fetchExams()
  }, [])

  // Función para obtener exámenes desde la API
  async function fetchExams() {
    try {
      const data = await getExams()
      setExams(data)
    } catch (err) {
      setMessage("Error al cargar exámenes")
      console.error(err)
    }
  }

  // Crear o actualizar examen
  async function onSubmit(values: z.infer<typeof examSchema>) {
    try {
      if (editing) {
        // Actualizar examen existente
        await updateExam(editing.id, values)
        setMessage("Examen actualizado correctamente")
      } else {
        // Crear nuevo examen
        await createExam(values)
        setMessage("Examen creado correctamente")
      }
      form.reset()
      setEditing(null)
      fetchExams()
    } catch (err) {
      setMessage("Error al guardar examen")
      console.error(err)
    }
  }

  // Eliminar examen
  async function handleDelete(id: string | number) {
    if (!confirm("¿Seguro que deseas eliminar este examen?")) return
    try {
      await deleteExam(id)
      setMessage("Examen eliminado correctamente")
      fetchExams()
    } catch (err) {
      setMessage("Error al eliminar examen")
      console.error(err)
    }
  }

  // Iniciar edición
  function handleEdit(e: Exam) {
    setEditing(e)
    form.reset({ name: e.name, subject: e.subject, duration: e.duration, date: e.date, creator: e.creator })
  }

  // Cancelar edición
  function handleCancelEdit() {
    setEditing(null)
    form.reset()
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Gestión de Exámenes</h1>
      <p className="mb-2 text-muted-foreground">
        Aquí puedes ver, crear y editar exámenes. Cada acción se conecta con la API usando fetch.
      </p>
      {message && <div className="mb-4 text-sm text-blue-600">{message}</div>}

      {/* Formulario para crear/editar examen */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-8 p-4 border rounded-lg">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del examen</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del examen" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Materia</FormLabel>
                <FormControl>
                  <Input placeholder="Materia del examen" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duración</FormLabel>
                <FormControl>
                  <Input placeholder="Duración en minutos" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha</FormLabel>
                <FormControl>
                  <Input placeholder="YYYY-MM-DD" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="creator"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Creador</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del creador (se asigna automáticamente)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button type="submit">{editing ? "Actualizar" : "Crear"} Examen</Button>
            {editing && <Button type="button" variant="outline" onClick={handleCancelEdit}>Cancelar</Button>}
          </div>
        </form>
      </Form>

      {/* Tabla/lista de exámenes */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Lista de Exámenes</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Materia</th>
              <th className="p-2 text-left">Duración</th>
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2 text-left">Creador</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((e) => (
              <tr key={e.id} className="border-b">
                <td className="p-2">{e.name}</td>
                <td className="p-2">{e.subject}</td>
                <td className="p-2">{e.duration}</td>
                <td className="p-2">{e.date}</td>
                <td className="p-2">{e.creator}</td>
                <td className="p-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(e)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(e.id)}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
            {exams.length === 0 && (
              <tr>
                <td colSpan={6} className="p-2 text-center text-muted-foreground">
                  No hay exámenes registrados.
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
