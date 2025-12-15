// src/app/dashboard/head_teacher/exam_to_validate/[id]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getExamById } from "@/services/examService";
import { getSubjectById } from "@/services/subjectService";
import { getTeacherByID } from "@/services/teacherService";
import { getParamsById } from "@/services/paramsService";
import { getHeadTeacherByID } from "@/services/headTeacerService";
import { getUserById } from "@/services/userService";
import { postApprovedExam } from "@/services/approvedExamService";
import { getQuestionById } from "@/services/questionService";
import { getCurrentUser } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ExamToValidateDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [paramsLabel, setParamsLabel] = useState<string | null>(null);
  const [headName, setHeadName] = useState<string | null>(null);
  
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [comments, setComments] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [fullQuestions, setFullQuestions] = useState<any[]>([]);

  // Cargar usuario actual
  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUser();
        setCurrentUserId(user?.id ?? null);
      } catch {
        const raw = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
        setCurrentUserId(raw ? Number(raw) : null);
      }
    }
    loadUser();
  }, []);

  // Cargar examen
  useEffect(() => {
    async function load() {
      try {
        const data = await getExamById(id);
        setExam(data);

        if (data?.subject_id) {
          try {
            const s = await getSubjectById(Number(data.subject_id));
            setSubjectName(s?.name ?? null);
          } catch (e) {
            console.error("Error fetching subject name", e);
          }
        }

        if (data?.teacher_id) {
          try {
            const t = await getTeacherByID(Number(data.teacher_id));
            setTeacherName(t?.user?.name ?? t?.name ?? null);
          } catch (e) {
            console.error("Error fetching teacher name", e);
          }
        }

        if (data?.parameters_id) {
          try {
            const p = await getParamsById(String(data.parameters_id));
            setParamsLabel(p ? `${p.proportion} / ${p.quest_topics}` : null);
          } catch (e) {
            console.error("Error fetching params", e);
          }
        }

        if (data?.head_teacher_id) {
          try {
            const h = await getHeadTeacherByID(Number(data.head_teacher_id));
            const fromHeadServiceName =
              h?.teacher?.user?.name ?? h?.user?.name ?? h?.name ?? null;

            if (fromHeadServiceName) {
              setHeadName(fromHeadServiceName);
            } else {
              const u = await getUserById(Number(data.head_teacher_id));
              setHeadName(u?.name ?? null);
            }
          } catch (e) {
            console.error("Error fetching head teacher", e);
            setHeadName(null);
          }
        }


        if (data?.exam_questions && Array.isArray(data.exam_questions) && data.exam_questions.length > 0) {
          try {
            // Extraer solo los IDs de las preguntas
            const questionIds = data.exam_questions
              .map((eq: any) => eq.question_id)
              .filter(Boolean);

            // Fetch de todos los detalles de las preguntas en paralelo
            const questionPromises = questionIds.map((qId: number | string) =>
              getQuestionById(String(qId)).catch((e) => {
                console.error(`Error fetching question ${qId}:`, e);
                return null; // Manejar errores por pregunta
              })
            );

            const resolvedQuestions = await Promise.all(questionPromises);
            setFullQuestions(resolvedQuestions.filter(q => q !== null)); // Guardar solo las que se cargaron correctamente
          } catch (e) {
            console.error("Error cargando detalles de preguntas:", e);
            setFullQuestions([]);
          }
        }

      } catch (error) {
        console.error(error);
        toast.error("Error de carga", {
          description:
            "Ocurrió un error al cargar el examen para validar.",
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleApprove = async () => {
    if (!currentUserId) {
      toast.error("Error de usuario", {
        description:
          "No se pudo obtener el ID del usuario actual.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const currentDate = Date.now(); // Timestamp en milisegundos
      await postApprovedExam({
        date_id: currentDate,
        exam_id: Number(id),
        head_teacher_id: currentUserId,
        guidelines: comments.trim(),
      });
      toast.success("Examen aprobado", {
        description: `El examen '${
          exam?.name ?? id
        }' fue aprobado correctamente.`,
      });
      router.push("/dashboard/head_teacher/exam_to_validate");
    } catch (error) {
      console.error("Error al aprobar examen:", error);
      console.error(error);
      toast.error("Error al aprobar", {
        description:
          "Ocurrió un error al intentar aprobar el examen.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!currentUserId) {
      toast.error("Error de usuario", {
        description:
          "No se pudo obtener el ID del usuario actual.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const currentDate = Date.now(); // Timestamp en milisegundos
      const guidelines = `Rechazado: ${comments.trim()}`;
      await postApprovedExam({
        date_id: currentDate,
        exam_id: Number(id),
        head_teacher_id: currentUserId,
        guidelines,
      });
      toast.success("Examen rechazado", {
        description: `El examen '${
          exam?.name ?? id
        }' fue rechazado.`,
      });
      router.push("/dashboard/head_teacher/exam_to_validate");
    } catch (error) {
      console.error("Error al rechazar examen:", error);
      toast.error("Error al rechazar", {
        description:
          "Ocurrió un error al intentar rechazar el examen.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-8">Cargando...</p>;
  if (!exam) return <p className="p-8">Examen no encontrado.</p>;

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-xl mx-auto p-6 border bg-card rounded-xl shadow-sm space-y-6">
        <h2 className="text-2xl font-semibold">Validar Examen</h2>

        <div className="space-y-3 text-foreground">
          <p><strong>Nombre:</strong> {exam.name}</p>
          <p><strong>Estado:</strong> {exam.status}</p>
          <p><strong>Dificultad:</strong> {exam.difficulty}</p>
          <p><strong>Asignatura:</strong> {subjectName ?? exam.subject_id}</p>
          <p><strong>Profesor:</strong> {teacherName ?? exam.teacher_id}</p>
          <p><strong>Parametrización:</strong> {paramsLabel ?? exam.parameters_id}</p>

          <p><strong>Jefe de Asignatura:</strong> {headName ?? exam.head_teacher_id}</p>
        </div>


        {fullQuestions.length > 0 && (
          <div className="pt-6 border-t border-border mt-6 space-y-4">
            <h3 className="text-xl font-semibold">Preguntas del Examen ({fullQuestions.length})</h3>
            
            <ul className="space-y-6">
              {fullQuestions.map((q: any, index: number) => (
                <li key={q.id || index} className="border-l-4 border-primary p-3 bg-gray-50 rounded-md">
                  {/* Título de la pregunta, usando question_text o text */}
                  <p className="font-medium">
                    {index + 1}. {q.question_text || q.text || "Pregunta sin texto"}
                  </p>
                  
                  {/* Visualización de Respuestas */}
                  
                  {/* Lógica 1: Mostrar Opciones (si el array 'answers' existe) */}
                  {q.answers && Array.isArray(q.answers) && q.answers.length > 0 ? (
                    <ul className="mt-2 ml-4 space-y-1 text-sm">
                      {q.answers.map((a: any, aIndex: number) => (
                        <li 
                          key={a.id || aIndex}
                          // Resalta la respuesta correcta
                          className={`flex gap-2 items-start ${a.is_correct ? 'text-green-700 font-semibold' : 'text-foreground/80'}`}
                        >
                          <span className='pt-0.5'>{a.is_correct ? '✅' : '•'}</span>
                          <span className={`${a.is_correct ? 'italic' : ''} flex-1`}>
                            {a.answer_text || a.text || "Respuesta sin texto"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    // Lógica 2: Mostrar Respuesta Única (si el campo 'answer' existe)
                    q.answer && (
                      <div className="mt-3 ml-4 p-3 border-l-4 border-green-500 bg-green-50 rounded-r-md text-sm text-green-800">
                        <p className="font-semibold mb-1 flex items-center gap-2">
                            <span className="text-base">✅</span> Respuesta Correcta (Teórica/Ensayo):
                        </p>
                        <p className="ml-5 mt-1">{q.answer}</p>
                      </div>
                    )
                  )}
                  
                  {/* Metadata de la pregunta (dificultad, tipo, temas) */}
                  <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-gray-200">
                    <span className="font-semibold">Info:</span>
                    {q.type && <span> {q.type}</span>}
                    {(q.type && q.difficulty) && <span className="mx-1">•</span>}
                    {q.difficulty && <span>{q.difficulty}</span>}
                    {q.topic?.name && <span className="mx-1">•</span>}
                    {q.topic?.name && <span>Tema: {q.topic.name}</span>}
                    {q.sub_topic?.name && <span className="mx-1">•</span>}
                    {q.sub_topic?.name && <span>Subtema: {q.sub_topic.name}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* ----------------------------------------------------------------- */}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => router.push("/dashboard/head_teacher/exam_to_validate")}>
            Volver
          </Button>

          <div className="flex gap-3">
            <Button variant="default" onClick={() => setShowApproveModal(true)}>
              Aprobar
            </Button>
            <Button variant="destructive" onClick={() => setShowRejectModal(true)}>
              Desaprobar
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Aprobar */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-md w-full space-y-4">
            <h3 className="text-lg font-semibold">Aprobar Examen</h3>
            <div>
              <label className="text-sm font-medium">Comentarios</label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Escribe tus comentarios aquí..."
                rows={4}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setShowApproveModal(false);
                setComments("");
              }}>
                Cancelar
              </Button>
              <Button onClick={handleApprove} disabled={submitting}>
                {submitting ? "Guardando..." : "Listo"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Desaprobar */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-md w-full space-y-4">
            <h3 className="text-lg font-semibold">Desaprobar Examen</h3>
            <div>
              <label className="text-sm font-medium">Comentarios</label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Escribe tus comentarios aquí..."
                rows={4}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setShowRejectModal(false);
                setComments("");
              }}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={submitting}>
                {submitting ? "Guardando..." : "Listo"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}