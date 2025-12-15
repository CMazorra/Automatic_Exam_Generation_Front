"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { login } from "@/services/authService"

import * as z from "zod"

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const formSchema = z.object({
  account: z.string(),
  password: z.string(),
})

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next")
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account: "",
      password: "",
    },
  })

  function setSessionCookies(role: string, headTeacher?: boolean) {
    const maxAge = 60 * 60 * 24 * 7 // 7 días
    document.cookie = `aeg_role=${role}; Path=/; Max-Age=${maxAge}; SameSite=Lax`
    document.cookie = `aeg_head=${headTeacher ? "1" : "0"}; Path=/; Max-Age=${maxAge}; SameSite=Lax`
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { user, headTeacher } = await login(values.account, values.password)

      // ← Setear cookies que el middleware lee
      setSessionCookies(user.role, headTeacher)

      const base =
        user.role === "ADMIN"
          ? "/dashboard/admin"
          : user.role === "TEACHER"
            ? (headTeacher ? "/dashboard/head_teacher" : "/dashboard/teacher")
            : "/dashboard/student"

      if (next && next.startsWith("/") && next.startsWith(base)) {
        router.push(next)
      } else {
        router.push(base)
      }
    } catch (err: any) {
      const errorMessage = typeof err?.message === "string" ? err.message : "Error al iniciar sesión. Inténtalo de nuevo."
      
      toast.error("Fallo al iniciar sesión", { // Título del Toast
          description: errorMessage, // Descripción del error detallada
      })
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="w-[350px] space-y-6 bg-card text-card-foreground p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold">Iniciar sesión</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="account"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cuenta</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
