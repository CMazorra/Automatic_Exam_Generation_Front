// page.tsx - Gestión de preguntas
// Esta vista permite listar, crear y editar preguntas usando react-hook-form y zod.
// Se conecta con questionService.ts y explica cada paso con comentarios educativos.

"use client"

import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "@/services/questionService"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

// Definimos el esquema de validación con Zod
// El esquema incluye todos los campos requeridos
const questionSchema = z.object({
  text: z.string().min(3, "El texto de la pregunta es obligatorio"), // Texto de la pregunta
  type: z.string().min(1, "Tipo requerido"), // Tipo de pregunta
  level: z.string().min(1, "Nivel requerido"), // Nivel de dificultad
  topic: z.string().min(1, "Tema requerido"), // Tema/subtema
  professor: z.string().min(1, "Profesor requerido"), // Profesor que la creó
  usage: z.array(z.string()).optional(), // Registro de uso (exámenes)
})

// Tipo para una pregunta
interface Question extends z.infer<typeof questionSchema> {
  id: string | number
}

export default function QuestionPage() {
  // Estado para la lista de preguntas
  const [questions, setQuestions] = useState<Question[]>([])
  // Estado para modo edición
  const [editing, setEditing] = useState<Question | null>(null)
  // Estado para mensajes de éxito/error
  const [message, setMessage] = useState<string>("")

  // Formulario con react-hook-form y zod
  const form = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: "",
      type: "",
      level: "",
      topic: "",
      professor: "", // En producción, se asigna automáticamente
      usage: [],
    },
  })

  // Cargar preguntas al montar el componente
  useEffect(() => {
    fetchQuestions()
  }, [])

  // Función para obtener preguntas desde la API
  async function fetchQuestions() {
    try {
      const data = await getQuestions()
      setQuestions(data)
    } catch (err) {
      setMessage("Error al cargar preguntas")
      console.error(err)
    }
  }

  // Crear o actualizar pregunta
  async function onSubmit(values: z.infer<typeof questionSchema>) {
    try {
      if (editing) {
        // Actualizar pregunta existente
        await updateQuestion(editing.id, values)
        setMessage("Pregunta actualizada correctamente")
      } else {
        // Crear nueva pregunta
        await createQuestion(values)
        setMessage("Pregunta creada correctamente")
      }
      form.reset()
      setEditing(null)
      fetchQuestions()
    } catch (err) {
      setMessage("Error al guardar pregunta")
      console.error(err)
    }
  }

  // Eliminar pregunta
  async function handleDelete(id: string | number) {
    if (!confirm("¿Seguro que deseas eliminar esta pregunta?")) return
    try {
      await deleteQuestion(id)
      setMessage("Pregunta eliminada correctamente")
      fetchQuestions()
    } catch (err) {
      setMessage("Error al eliminar pregunta")
      console.error(err)
    }
  }

  // Iniciar edición
  function handleEdit(q: Question) {
    setEditing(q)
    form.reset({
      text: q.text,
      type: q.type,
      level: q.level,
      topic: q.topic,
      professor: q.professor,
      usage: q.usage || [],
    })
  }

  // Cancelar edición
  function handleCancelEdit() {
    setEditing(null)
    form.reset()
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Gestión de Preguntas</h1>
      <p className="mb-2 text-muted-foreground">
        Aquí puedes ver, crear y editar preguntas. Cada acción se conecta con la API usando fetch.
      </p>
      {message && <div className="mb-4 text-sm text-blue-600">{message}</div>}

      {/* Formulario para crear/editar pregunta */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-8 p-4 border rounded-lg">
          {/* Texto de la pregunta */}
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Texto de la pregunta</FormLabel>
                <FormControl>
                  <Input placeholder="Escribe la pregunta aquí" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Tipo de pregunta */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de pregunta</FormLabel>
                <FormControl>
                  <Input placeholder="Opción múltiple, Verdadero/Falso, Ensayo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Nivel de dificultad */}
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nivel de dificultad</FormLabel>
                <FormControl>
                  <Input placeholder="Fácil, Medio, Difícil" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Tema y subtema */}
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tema y subtema</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: Matemáticas - Álgebra" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Profesor que la creó (en producción, se asigna automáticamente) */}
          <FormField
            control={form.control}
            name="professor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profesor</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del profesor (se asigna automáticamente)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Registro de uso (exámenes) */}
          <FormField
            control={form.control}
            name="usage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registro de uso (exámenes)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Examen1, Examen2" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button type="submit">{editing ? "Actualizar" : "Crear"} Pregunta</Button>
            {editing && <Button type="button" variant="outline" onClick={handleCancelEdit}>Cancelar</Button>}
          </div>
        </form>
      </Form>

      {/* Tabla/lista de preguntas con todos los campos */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Lista de Preguntas</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="p-2 text-left">Texto</th>
              <th className="p-2 text-left">Tipo</th>
              <th className="p-2 text-left">Nivel</th>
              <th className="p-2 text-left">Tema/Subtema</th>
              <th className="p-2 text-left">Profesor</th>
              <th className="p-2 text-left">Registro de uso</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id} className="border-b">
                <td className="p-2">{q.text}</td>
                <td className="p-2">{q.type}</td>
                <td className="p-2">{q.level}</td>
                <td className="p-2">{q.topic}</td>
                <td className="p-2">{q.professor}</td>
                <td className="p-2">{Array.isArray(q.usage) ? q.usage.join(", ") : ""}</td>
                <td className="p-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(q)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(q.id)}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
            {questions.length === 0 && (
              <tr>
                <td colSpan={7} className="p-2 text-center text-muted-foreground">
                  No hay preguntas registradas.
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
