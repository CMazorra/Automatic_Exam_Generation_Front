"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { getUserById, updateUser } from "@/services/userService"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

// Zod schema for user editing
const userEditSchema = z.object({
  name: z.string().min(3, "El nombre es obligatorio").max(100),
  account: z.string().min(3, "La cuenta es obligatoria").max(50),
  age: z.number().int().min(1, "La edad debe ser mayor a 0"),
  course: z.string().min(1, "El curso es obligatorio").max(100),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"], {
    errorMap: () => ({ message: "Rol es obligatorio" })
  }),
  // Optional password field for optional updates
  password: z.string().max(100).optional()
})

export default function UserEditPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<string>("")
  const router = useRouter()

  const form = useForm<z.infer<typeof userEditSchema>>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      name: "",
      account: "",
      age: 18,
      course: "",
      role: "STUDENT",
      password: "",
    },
  })

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await getUserById(params.id)
        setUser(userData)
        form.reset({
          name: userData.name,
          account: userData.account,
          age: userData.age,
          course: userData.course,
          role: userData.role,
        })
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching user:", error)
        setIsLoading(false)
        setMessage("Error al cargar usuario")
      }
    }
    fetchUser()
  }, [params.id])

  async function onSubmit(values: z.infer<typeof userEditSchema>) {
    try {
      // Only send password if it's not empty
      const updateData = values.password 
        ? values 
        : { ...values, password: undefined }

      await updateUser(params.id, updateData)
      setMessage("Usuario actualizado correctamente")
      setTimeout(() => router.push("/dashboard/admin/user"), 1000)
    } catch (err: any) {
      setMessage(err.message || "Error al actualizar usuario")
      console.error(err)
    }
  }

  if (isLoading) {
    return <div>Cargando...</div>
  }

  if (!user) {
    return <div>Usuario no encontrado</div>
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Editar Usuario</h1>
      {message && <div className="mb-4 text-sm text-blue-600">{message}</div>}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg">
          {/* Form fields similar to create user page, but with optional password */}
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña (opcional)</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Dejar en blanco si no desea cambiar" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Add other fields like account, age, course, role similar to create user page */}
          {/* ... */}

          <Button type="submit" className="w-full">Actualizar Usuario</Button>
        </form>
      </Form>
    </div>
  )
}