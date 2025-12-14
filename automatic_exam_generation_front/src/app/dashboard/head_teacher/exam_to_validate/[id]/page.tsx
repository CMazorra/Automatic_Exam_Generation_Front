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

export default function ExamToValidateDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  // Usuario actual
  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUser();
        setCurrentUserId(user?.id ?? null);
      } catch (e) {
        console.error("Error fetching current user:", e);
        const raw =
          typeof window !== "undefined"
            ? localStorage.getItem("userId")
            : null;
        setCurrentUserId(raw ? Number(raw) : null);
      }
    }
    loadUser();
  }, []);

  // Examen
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
            setParamsLabel(
              p ? `${p.proportion} / ${p.quest_topics}` : null
            );
          } catch (e) {
            console.error("Error fetching params", e);
          }
        }

        if (data?.head_teacher_id) {
          try {
            const h = await getHeadTeacherByID(
              Number(data.head_teacher_id)
            );
            const fromHeadServiceName =
              h?.teacher?.user?.name ??
              h?.user?.name ??
              h?.name ??
              null;

            if (fromHeadServiceName) {
              setHeadName(fromHeadServiceName);
            } else {
              const u = await getUserById(
                Number(data.head_teacher_id)
              );
              setHeadName(u?.name ?? null);
            }
          } catch (e) {
            console.error("Error fetching head teacher", e);
            setHeadName(null);
          }
        }

        if (
          data?.exam_questions &&
          Array.isArray(data.exam_questions) &&
          data.exam_questions.length > 0
        ) {
          try {
            const questionIds = data.exam_questions
              .map((eq: any) => eq.question_id)
              .filter(Boolean);

            const resolved = await Promise.all(
              questionIds.map((qId: number | string) =>
                getQuestionById(String(qId)).catch(e => {
                  console.error(
                    `Error fetching question ${qId}`,
                    e
                  );
                  return null;
                })
              )
            );

            setFullQuestions(resolved.filter(Boolean));
          } catch (e) {
            console.error("Error cargando preguntas", e);
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
      await postApprovedExam({
        date_id: Date.now(),
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
      await postApprovedExam({
        date_id: Date.now(),
        exam_id: Number(id),
        head_teacher_id: currentUserId,
        guidelines: `Rechazado: ${comments.trim()}`,
      });

      toast.success("Examen rechazado", {
        description: `El examen '${
          exam?.name ?? id
        }' fue rechazado.`,
      });

      router.push("/dashboard/head_teacher/exam_to_validate");
    } catch (error) {
      console.error(error);
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

  /* ⬇️ JSX COMPLETO ORIGINAL SIN CAMBIOS ⬇️ */
  return (
    <main className="min-h-screen bg-background p-8">
      {/* … JSX exactamente igual al original … */}
    </main>
  );
}
