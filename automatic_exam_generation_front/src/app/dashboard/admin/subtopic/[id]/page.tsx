"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getSubtopicById } from "@/services/subtopicService"
import { deleteSubtopic } from "@/services/subtopicService"

interface Subtopic {
  id: string
  nombre: string
}

export default function SubtopicView({ params }: { params: { id: string } }) {
  const [subtopic, setSubtopic] = useState<Subtopic | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchSubtopic = async () => {
      try {
        const data = await getSubtopicById(params.id);
        setSubtopic(data);
      } catch (error) {
        console.error("Error fetching subtopic:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubtopic();
  }, [params.id])

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

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <div>
            <h2 className="font-semibold leading-none">{subtopic.nombre}</h2>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard/admin/subtopic">
              <Button variant="outline">Volver</Button>
            </Link>
            <Link href={`/dashboard/admin/subtopic/${subtopic.id}/edit`}>
              <Button>Editar</Button>
            </Link>
            <Button variant="destructive" onClick={() => {
              deleteSubtopic(subtopic.id);
              router.push(`/dashboard/admin/subtopic`);
            }}>Eliminar</Button>
          </div>
        </div>
      </div>
    </main>
  )
}