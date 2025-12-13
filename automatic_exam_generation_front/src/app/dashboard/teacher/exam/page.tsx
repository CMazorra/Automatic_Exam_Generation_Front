// app/dashboard/teacher/exam/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { getExams } from "@/services/examService"
import { getCurrentUser } from "@/services/authService"
import { getSubjectsFlatByTeacherID } from "@/services/subjectService"

import { ListViewWithAdd } from "@/components/list-view-with-add"
import { Button } from "@/components/ui/button"

interface Exam {
  id: number
  name: string
  status: string
  difficulty: string
  subject_id: number
  teacher_id: number
  parameters_id: number
  head_teacher_id: number
}

export default function TeacherExamListPage() {
  const router = useRouter()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadExams() {
      try {
        // 1. Obtener el ID del profesor (usuario actual)
        let finalUserId: number | null = null;

        try {
          const user = await getCurrentUser();
          finalUserId = user.id ?? null;
        } catch (e) {
          const rawUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
          finalUserId = rawUserId ? Number(rawUserId) : null;

          console.error("[teacher/exam] getCurrentUser falló, usando localStorage", {
            rawUserId,
            finalUserId,
            error: e,
          });
        }

        if (!finalUserId) {
          setExams([]);
          return;
        }

        // 2. Obtener asignaturas del profesor (subjectService)
        let teacherSubjects: any[] = [];

        try {
          const subjectsData = await getSubjectsFlatByTeacherID(String(finalUserId));

          if (Array.isArray(subjectsData)) {
            teacherSubjects = subjectsData;
          } else if (subjectsData?.data && Array.isArray(subjectsData.data)) {
            teacherSubjects = subjectsData.data;
          }
        } catch (err) {
          console.error("[teacher/exam] Error al obtener asignaturas", err);
        }

        const teacherSubjectIds = teacherSubjects.map((s: any) => s.id).filter(Boolean);

        if (teacherSubjectIds.length === 0) {
          setExams([]);
          return;
        }

        // 3. Obtener todos los exámenes
        const allExams: Exam[] = await getExams();

        // 4. Filtrar por asignaturas del profesor
        const filteredExams = allExams.filter(exam =>
          teacherSubjectIds.includes(exam.subject_id)
        );

        setExams(filteredExams);
      } catch (e) {
        console.error("Error al cargar o filtrar exámenes", e);
      } finally {
        setLoading(false);
      }
    }

    loadExams();
  }, []);

  if (loading) return <p className="p-8">Cargando exámenes...</p>;

  return (
    <ListViewWithAdd
      title="Exámenes"
      entities={exams}
      sortFields={[
        { value: "name", label: "Nombre" },
        { value: "difficulty", label: "Dificultad" },
      ]}
      filterFields={[{ value: "status", label: "Estado" }]}
      renderEntity={(exam) => (
        <div className="rounded-lg border border-border bg-card p-4 hover:bg-accent/5">
          <h3 className="font-semibold text-sm text-card-foreground">{exam.name}</h3>

          <div className="flex gap-2 text-xs mt-1">
            <span className="px-2 py-0.5 rounded bg-muted">{exam.difficulty}</span>
            <span
              className={`px-2 py-0.5 rounded ${
                exam.status === "PUBLISHED"
                  ? "bg-green-200 text-green-800"
                  : exam.status === "DRAFT"
                  ? "bg-yellow-200 text-yellow-800"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {exam.status}
            </span>
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/teacher/exam/${exam.id}`)}
            >
              Ver detalles
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/teacher/exam/${exam.id}/edit`)}
            >
              Editar
            </Button>
          </div>
        </div>
      )}
      onAdd={() => router.push("/dashboard/teacher/exam/new")}
    />
  );
}
