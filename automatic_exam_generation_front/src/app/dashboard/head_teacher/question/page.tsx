"use client"

import { useEffect, useState } from "react"
import { ListViewWithAdd } from "@/components/list-view-with-add"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getQuestions } from "@/services/questionService"
import { getSubjectById } from "@/services/subjectService"
import { getTopicById } from "@/services/topicService"
import { getSubtopicById } from "@/services/subtopicService"
import { getTeacherByID } from "@/services/teacherService"

export default function SubjectPage() {
    const router = useRouter()
    const [entities, setEntities] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      let mounted = true
      async function load() {
        try {
          setLoading(true)
          const questions = await getQuestions()
          const questionsArray = Array.isArray(questions) ? questions : []

          const enrichedQuestions = await Promise.all(
            questionsArray.map(async (question) => {
              try {
                // Obtener nombre de la asignatura
                let subjectName = "Sin asignar"
                if (question.subject_id) {
                  try {
                    const subject = await getSubjectById(Number(question.subject_id))
                    subjectName = subject?.name || "Sin asignar"
                  } catch (err) {
                    console.error(`Error obteniendo asignatura:`, err)
                    subjectName = "Error al cargar"
                  }
                }

                // Obtener nombre del tema
                let topicName = "Sin asignar"
                if (question.topic_id) {
                  try {
                    const topic = await getTopicById(String(question.topic_id))
                    topicName = topic?.name || "Sin asignar"
                  } catch (err) {
                    console.error(`Error obteniendo tema:`, err)
                    topicName = "Error al cargar"
                  }
                }

                // Obtener nombre del subtema
                let subTopicName = "Sin asignar"
                if (question.sub_topic_id) {
                  try {
                    const subTopic = await getSubtopicById(String(question.sub_topic_id),String(question.topic_id))
                    subTopicName = subTopic?.name || "Sin asignar"
                  } catch (err) {
                    console.error(`Error obteniendo subtema:`, err)
                    subTopicName = "Error al cargar"
                  }
                }

                // Obtener nombre del creador (profesor)
                let creatorName = "Sin asignar"
                if (question.teacher_id) {
                  try {
                    const creator = await getTeacherByID(question.teacher_id)
                    creatorName = creator?.user?.name || "Sin asignar"
                  } catch (err) {
                    console.error(`Error obteniendo creador:`, err)
                    creatorName = "Error al cargar"
                  }
                }

                return {
                  ...question,
                  subject_name: subjectName,
                  topic_name: topicName,
                  sub_topic_name: subTopicName,
                  creator_name: creatorName
                }
              } catch (err) {
                console.error(`Error procesando pregunta ${question.id}:`, err)
                return {
                  ...question,
                  subject_name: "Error al cargar",
                  topic_name: "Error al cargar",
                  sub_topic_name: "Error al cargar",
                  creator_name: "Error al cargar"
                }
              }
            })
          )

          if (mounted) setEntities(enrichedQuestions)
        } catch (err) {
          console.error("Error cargando preguntas:", err)
          if (mounted) setEntities([])
        } finally {
          if (mounted) setLoading(false)
        }
      }
      load()
      return () => { mounted = false }
    }, [])

    return (
      <ListViewWithAdd
        title="Lista de Preguntas"
        entities={entities}
        sortFields={[
          { value: "difficulty", label: "Dificultad" },
          { value: "type", label: "Tipo" },
          { value: "subject_name", label: "Asignatura" },
          { value: "topic_name", label: "Tema" },
          { value: "creator_name", label: "Creador" },
        ]}
        filterFields={[
          { value: "difficulty", label: "Dificultad" },
          { value: "type", label: "Tipo" },
          { value: "subject_name", label: "Asignatura" },
          { value: "topic_name", label: "Tema" },
          { value: "sub_topic_name", label: "Subtema" },
          { value: "creator_name", label: "Creador" },
        ]}
        renderEntity={(question) => (
          <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-card-foreground">{question.question_text}</h3>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Tipo: {question.type}</span>
                  <span>Dificultad: {question.difficulty}</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/head_teacher/question/${question.id}`)}>
                Ver detalles
              </Button>
            </div>
          </div>
        )}
        onAdd={() => router.push("/dashboard/head_teacher/question/new")}
      />
    )
}