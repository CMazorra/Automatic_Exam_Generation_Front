"use client"

import React, { use, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getSubtopicById, deleteSubtopic } from "@/services/subtopicService"

interface Subtopic {
  id: string
  topic_id: string
  name?: string
  nombre?: string
}

export default function SubtopicView({
  params,
}: {
  params: Promise<{ id: string; topic_id: string }>
}) {
  const { id, topic_id } = use(params)
  const [subtopic, setSubtopic] = useState<Subtopic | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchSubtopic = async () => {
      try {
        const data = await (getSubtopicById as any)(id, topic_id)
        setSubtopic(data)
      } catch (error) {
        console.error("Error fetching subtopic:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSubtopic()
  }, [id, topic_id])

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">Cargando...</div>
      </main>
    )
  }

  if (!subtopic) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center text-destructive">Subtema no encontrado</div>
      </main>
    )
  }

  const displayName = subtopic.name || subtopic.nombre || "(Sin nombre)"

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <div>
            <h2 className="font-semibold leading-none">{displayName}</h2>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard/admin/subtopic">
              <Button variant="outline">Volver</Button>
            </Link>
            <Link
              href={`/dashboard/admin/subtopic/${subtopic.id}/${subtopic.topic_id}/edit`}
            >
              <Button>Editar</Button>
            </Link>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  await (deleteSubtopic as any)(subtopic.id, subtopic.topic_id)
                  router.push(`/dashboard/admin/subtopic`)
                } catch (e) {
                  console.error(e)
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}