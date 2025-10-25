"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { login } from "@/services/authService"

import * as z from "zod"

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
  email: z.email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Mínimo 6 caracteres" }),
})

export default function LoginPage() {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    login(values.email, values.password)
    .then((data) => {
      console.log("Login exitoso:", data)
      if(data == "Administrator")
        {
          router.push("/dashboard/admin")
        }
      else if(data == "Teacher")
        {
          router.push("/dashboard/teacher")
        }
      else
        {
          router.push("/dashboard/student")
        }
    })
    .catch((err) => {
      console.error(err)
      alert("Error al iniciar sesión")
    })
  }

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="w-[350px] space-y-6 bg-card text-card-foreground p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold">Iniciar sesión</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="tu@email.com" {...field} />
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
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">Entrar</Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
