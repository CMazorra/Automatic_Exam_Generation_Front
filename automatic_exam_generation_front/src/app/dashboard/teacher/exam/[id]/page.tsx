"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getExamById, deleteExam } from "@/services/examService";
import { getSubjectById } from "@/services/subjectService"
import { getTeacherByID } from "@/services/teacherService"
import { getParamsById } from "@/services/paramsService"
import { getHeadTeacherByID } from "@/services/headTeacerService"
import { getUserById } from "@/services/userService"
import { getQuestionById } from "@/services/questionService"
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // <-- Importamos TOAST

export default function ExamDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState<string | null>(null)
  const [teacherName, setTeacherName] = useState<string | null>(null)
  const [paramsLabel, setParamsLabel] = useState<string | null>(null)
  const [headName, setHeadName] = useState<string | null>(null)
  const [questions, setQuestions] = useState<any[]>([])

  // Cargar examen
  useEffect(() => {
    async function load() {
      try {
        const data = await getExamById(id);
        setExam(data);
        
        // fetch related names
        if (data?.subject_id) {
          try {
            const s = await getSubjectById(Number(data.subject_id))
            setSubjectName(s?.name ?? null)
          } catch (e) {
            console.error('Error fetching subject name', e)
          }
        }
        if (data?.teacher_id) {
          try {
            const t = await getTeacherByID(Number(data.teacher_id))
            setTeacherName(t?.user?.name ?? t?.name ?? null)
          } catch (e) {
            console.error('Error fetching teacher name', e)
          }
        }
        if (data?.parameters_id) {
          try {
            const p = await getParamsById(String(data.parameters_id))
            setParamsLabel(p ? `${p.proportion} / ${p.quest_topics}` : null)
          } catch (e) {
            console.error('Error fetching params', e)
          }
        }
        if (data?.head_teacher_id) {
          try {
            const h = await getHeadTeacherByID(Number(data.head_teacher_id))
            const fromHeadServiceName =
              h?.teacher?.user?.name ??
              h?.user?.name ??
              h?.name ??
              null

            if (fromHeadServiceName) {
              setHeadName(fromHeadServiceName)
            } else {
              const u = await getUserById(Number(data.head_teacher_id))
              setHeadName(u?.name ?? null)
            }
          } catch (e) {
            console.error('Error fetching head teacher', e)
            setHeadName(null)
          }
        }

        // Cargar preguntas desde exam_questions
        if (data?.exam_questions && Array.isArray(data.exam_questions)) {
          try {
            const questionPromises = data.exam_questions.map((eq: any) => {
              const questionId = eq.question_id || eq.id
              return getQuestionById(questionId).catch(err => {
                console.error(`Error fetching question ${questionId}:`, err)
                return null
              })
            })
            const questionsData = await Promise.all(questionPromises)
            setQuestions(questionsData.filter(q => q !== null))
          } catch (e) {
            console.error('Error fetching questions', e)
            setQuestions([])
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Error de Carga", {
            description: "No se pudo cargar la información del examen.",
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleDelete = async () => {
//     if (!window.confirm("¿Seguro que deseas eliminar este examen? Esta acción es irreversible.")) return; // Mantengo window.confirm para una confirmación fuerte

    // Usamos toast.promise para manejar la eliminación
    toast.promise(deleteExam(id), {
        loading: 'Eliminando examen...',
        success: () => {
            router.push("/dashboard/teacher/exam");
            return "Examen eliminado con éxito.";
        },
        error: () => {
            return "Error al eliminar el examen. Inténtalo de nuevo.";
        },
    });
  };

  if (loading) return <p className="p-8">Cargando...</p>;
  if (!exam) return <p className="p-8">Examen no encontrado.</p>;

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-xl mx-auto p-6 border bg-card rounded-xl shadow-sm space-y-6">
        <h2 className="text-2xl font-semibold">Detalles del Examen</h2>

        <div className="space-y-3 text-foreground">
          <p><strong>Nombre:</strong> {exam.name}</p>
          <p><strong>Estado:</strong> {exam.status}</p>
          <p><strong>Dificultad:</strong> {exam.difficulty}</p>

          <p><strong>Asignatura:</strong> {subjectName ?? exam.subject_id}</p>
          <p><strong>Profesor:</strong> {teacherName ?? exam.teacher_id}</p>
          <p><strong>Parametrización:</strong> {paramsLabel ?? exam.parameters_id}</p>
          <p><strong>Jefe de Asignatura:</strong> {headName ?? exam.head_teacher_id}</p>
        </div>

        {/* Sección de preguntas */}
        {questions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Preguntas ({questions.length})</h3>
            <ul className="space-y-2 border rounded-lg p-4 bg-muted/30">
              {questions.map((q: any, idx: number) => (
                <li key={q.id || idx} className="text-sm border-b border-border pb-2 last:border-b-0">
                  <p className="font-medium">{idx + 1}. {q.question_text || q.text || q.statement || "Sin texto"}</p>
                  {q.type && <span className="text-xs text-muted-foreground">Tipo: {q.type}</span>}
                  {q.difficulty && <span className="text-xs text-muted-foreground ml-2">Dificultad: {q.difficulty}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => router.push("/dashboard/teacher/exam")}>
            Volver
          </Button>

          <div className="flex gap-3">
            <Button onClick={() => router.push(`/dashboard/teacher/exam/${id}/edit`)}>
              Editar
            </Button>

            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}