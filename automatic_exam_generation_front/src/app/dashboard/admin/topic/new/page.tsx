"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldGroup, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { postTopic } from "@/services/topicService"

export default function Home() {
  const [nombre, setNombre] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!nombre.trim()) {
      return
    }

    setIsLoading(true)
    try {
      console.log("Topic submitted:", { name: nombre.trim() })

      await postTopic({ name: nombre.trim() })
      router.push(`/dashboard/admin/topic`)

      setNombre("")
    } catch (err) {
      console.error(err)
      alert("Hubo un error al crear el tema.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <div>
            <h2 className="font-semibold leading-none">Nuevo Tema</h2>
          </div>

          <FieldGroup>
            <FieldSet>
              <Field>
                <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
                <Input
                  id="nombre"
                  placeholder="Nombre del tema"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </Field>
            </FieldSet>
          </FieldGroup>

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading || !nombre.trim()}>
              {isLoading ? "Creando..." : "Crear Tema"}
            </Button>
          </div>
        </div>
      </form>
    </main>
  )
}