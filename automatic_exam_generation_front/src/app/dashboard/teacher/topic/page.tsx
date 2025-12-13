"use client"

import { useEffect, useState } from "react"
import { ListViewWithAdd } from "@/components/list-view-with-add"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/services/authService"
import { getSubjectsFlatByTeacherID } from "@/services/subjectService"
import { getTopicsBySubjectId } from "@/services/topicService"

export default function TopicPage() {
    const router = useRouter()
    const [entities, setEntities] = useState<any[]>([])

    useEffect(() => {
      let mounted = true
      async function load() {
        try {
          const user = await getCurrentUser()
          const teacherId = user?.id ? String(user.id) : (user?._id ? String(user._id) : "")
          if (!teacherId) {
            setEntities([])
            return
          }

          const subjects = await getSubjectsFlatByTeacherID(teacherId)
          if (!Array.isArray(subjects) || subjects.length === 0) {
            setEntities([])
            return
          }

          const topicsBySubject = await Promise.all(
            subjects.map((s: any) => getTopicsBySubjectId(String(s.id ?? s._id ?? s.subject_id ?? "")))
          )
          const topics = topicsBySubject.flat().filter(Boolean)
          if (mounted) setEntities(topics)
        } catch (err) {
          console.error(err)
        }
      }
      load()
      return () => { mounted = false }
    }, [])

    return (
      <ListViewWithAdd
        title="Lista de Temas"
        entities = {entities}
        sortFields={[
          { value: "name", label: "Nombre" },
        ]}
        filterFields={[
          { value: "name", label: "Nombre" },
        ]}
        renderEntity={(topic) => (
          <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-card-foreground">{topic.name}</h3>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/teacher/topic/${topic.id}`)}>
                Ver detalles
              </Button>
            </div>
          </div>
        )}
        onAdd={() => router.push("/dashboard/teacher/topic/new")}
      />
    )
}