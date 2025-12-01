"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getExamById } from "@/services/examService";
import { getSubjectById } from "@/services/subjectService";
import { getTeacherByID } from "@/services/teacherService";
import { getParamsById } from "@/services/paramsService";
import { getHeadTeacherByID } from "@/services/headTeacerService";
import { getUserById } from "@/services/userService";
import { postApprovedExam } from "@/services/approvedExamService";
import { getCurrentUser } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ExamToValidateDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

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
      } catch (error) {
        console.error(error);
        alert("Error al cargar el examen.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleApprove = async () => {
    if (!currentUserId) {
      alert("No se pudo obtener el ID del usuario actual.");
      return;
    }

    setSubmitting(true);
    try {
      await postApprovedExam({
        exam_id: Number(id),
        head_teacher_id: currentUserId,
        guidelines: comments.trim(),
      });
      alert("Examen aprobado exitosamente.");
      router.push("/dashboard/head_teacher/exam_to_validate");
    } catch (error) {
      console.error("Error al aprobar examen:", error);
      alert("Error al aprobar el examen.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!currentUserId) {
      alert("No se pudo obtener el ID del usuario actual.");
      return;
    }

    setSubmitting(true);
    try {
      const guidelines = `Rechazado: ${comments.trim()}`;
      await postApprovedExam({
        exam_id: Number(id),
        head_teacher_id: currentUserId,
        guidelines,
      });
      alert("Examen rechazado.");
      router.push("/dashboard/head_teacher/exam_to_validate");
    } catch (error) {
      console.error("Error al rechazar examen:", error);
      alert("Error al rechazar el examen.");
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