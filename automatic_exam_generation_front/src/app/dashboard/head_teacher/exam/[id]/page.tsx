"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getExamById, deleteExam } from "@/services/examService";
import { getSubjectById } from "@/services/subjectService";
import { getTeacherByID } from "@/services/teacherService";
import { getParamsById } from "@/services/paramsService";
import { getHeadTeacherByID } from "@/services/headTeacerService";
import { getUserById } from "@/services/userService";
import { getQuestionById } from "@/services/questionService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";

export default function ExamDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [subjectName, setSubjectName] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [paramsLabel, setParamsLabel] = useState<string | null>(null);
  const [headName, setHeadName] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  // ========================
  // Cargar examen y relaciones
  // ========================
  useEffect(() => {
    async function load() {
      try {
        const data = await getExamById(id);
        setExam(data);

        if (data?.subject_id) {
          try {
            const s = await getSubjectById(Number(data.subject_id));
            setSubjectName(s?.name ?? null);
          } catch {
            toast.error("No se pudo cargar la asignatura");
          }
        }

        if (data?.teacher_id) {
          try {
            const t = await getTeacherByID(Number(data.teacher_id));
            setTeacherName(t?.user?.name ?? t?.name ?? null);
          } catch {
            toast.error("No se pudo cargar el profesor");
          }
        }

        if (data?.parameters_id) {
          try {
            const p = await getParamsById(String(data.parameters_id));
            setParamsLabel(p ? `${p.proportion} / ${p.quest_topics}` : null);
          } catch {
            toast.error("No se pudieron cargar los parámetros");
          }
        }

        if (data?.head_teacher_id) {
          try {
            const h = await getHeadTeacherByID(Number(data.head_teacher_id));
            const name =
              h?.teacher?.user?.name ??
              h?.user?.name ??
              h?.name ??
              null;

            if (name) {
              setHeadName(name);
            } else {
              const u = await getUserById(Number(data.head_teacher_id));
              setHeadName(u?.name ?? null);
            }
          } catch {
            toast.error("No se pudo cargar el jefe de asignatura");
          }
        }

        if (Array.isArray(data?.exam_questions)) {
          const qs = await Promise.all(
            data.exam_questions.map((eq: any) =>
              getQuestionById(eq.question_id || eq.id).catch(() => null)
            )
          );
          setQuestions(qs.filter(Boolean));
        }
      } catch (e: any) {
        toast.error("Error al cargar el examen", {
          description: e?.message,
        });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  // ========================
  // Eliminar examen
  // ========================
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteExam(id);
      toast.success("Examen eliminado correctamente");
      router.push("/dashboard/head_teacher/exam");
    } catch (e: any) {
      toast.error("Error al eliminar el examen", {
        description: e?.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <p className="p-8">Cargando...</p>;
  if (!exam) return <p className="p-8">Examen no encontrado.</p>;

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-xl mx-auto p-6 border bg-card rounded-xl shadow-sm space-y-6">
        <h2 className="text-2xl font-semibold">
          Detalles del Examen: {exam.name}
        </h2>

        <div className="space-y-3 text-foreground">
          <p><strong>Estado:</strong> {exam.status}</p>
          <p><strong>Dificultad:</strong> {exam.difficulty}</p>
          <p><strong>Asignatura:</strong> {subjectName ?? exam.subject_id}</p>
          <p><strong>Profesor:</strong> {teacherName ?? exam.teacher_id}</p>
          <p><strong>Parametrización:</strong> {paramsLabel ?? exam.parameters_id}</p>
          <p><strong>Jefe de Asignatura:</strong> {headName ?? exam.head_teacher_id}</p>
        </div>

        {questions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">
              Preguntas ({questions.length})
            </h3>
            <ul className="space-y-2 border rounded-lg p-4 bg-muted/30">
              {questions.map((q: any, i) => (
                <li
                  key={q.id ?? i}
                  className="text-sm border-b pb-2 last:border-b-0"
                >
                  <p className="font-medium">
                    {i + 1}. {q.question_text || "Sin texto"}
                  </p>
                  {q.type && (
                    <span className="text-xs text-muted-foreground">
                      Tipo: {q.type}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/head_teacher/exam")}
          >
            Volver
          </Button>

          <div className="flex gap-3">
            <Button
              onClick={() =>
                router.push(`/dashboard/head_teacher/exam/${id}/edit`)
              }
            >
              Editar
            </Button>

            <ConfirmDeleteDialog
              title={`Eliminar examen "${exam.name}"`}
              description="Esta acción es irreversible."
              onConfirm={handleDelete}
              buttonText={isDeleting ? "Eliminando..." : "Eliminar"}
            >
              <Button variant="destructive" disabled={isDeleting}>
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </Button>
            </ConfirmDeleteDialog>
          </div>
        </div>
      </div>
    </main>
  );
}
