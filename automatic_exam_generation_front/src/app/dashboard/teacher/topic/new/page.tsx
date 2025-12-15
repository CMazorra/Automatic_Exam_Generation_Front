"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { postTopic, updateTopic_Subject } from "@/services/topicService"

export default function TopicNewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const subjectId = searchParams.get("subjectId") || ""
  const returnTo = searchParams.get("returnTo") || ""
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const created = await postTopic({ name: name.trim() })
      const topicId = String(created?.id ?? created?.topic?.id ?? "")
      if (!topicId) throw new Error("No se pudo obtener el ID del tema creado.")

      if (subjectId) {
        await updateTopic_Subject(topicId,subjectId)
      }

      if (returnTo) {
        router.push(returnTo)
      }
      else {
        router.push(`/dashboard/teacher/topic`)
      }
    } catch (err: any) {
      console.error(err)
      alert(err?.message || "Error al crear el tema.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-xl space-y-6 rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Nuevo Tema</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Nombre</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del tema"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                returnTo
                  ? router.push(returnTo)
                  : router.push("/dashboard/teacher/topic")
              }
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? "Guardando..." : "Crear"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}