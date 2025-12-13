// src/app/dashboard/student/recalification/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getCurrentUser } from "@/services/authService";
import { getTeachersWithSubjects } from "@/services/teacherService";
import { postRecalificationRequest } from "@/services/reevaluationService";
import { getExamStudentById } from "@/services/examStudentService";
import { getExamById } from "@/services/examService";

// =========================================================
// SONNER (Toast moderno)
// =========================================================
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

// =========================================================
// UI COMPONENTS
// =========================================================
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Loader2 } from "lucide-react";

// =========================================================
// TYPES
// =========================================================
interface Subject {
  id: number;
  name: string;
}

interface Teacher {
  id: number;
  name: string;
  subjects?: Subject[];
}

// =========================================================
// PAGE
// =========================================================
export default function ReevaluationRequestPage() {
  const params = useParams();
  const router = useRouter();
  const examId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);

  const [studentId, setStudentId] = useState<number | null>(null);
  const [globalScore, setGlobalScore] = useState<number | null>(null);
  const [examName, setExamName] = useState("Examen");
  const [subjectId, setSubjectId] = useState<number | null>(null);

  // =========================================================
  // LOAD DATA
  // =========================================================
  useEffect(() => {
    if (!examId) return;

    async function loadData() {
      setLoading(true);
      try {
        const user = await getCurrentUser();
        const currentStudentId = user?.id ?? null;
        setStudentId(currentStudentId);

        if (!currentStudentId) {
          toast.error("Usuario no identificado", {
            description: "Por favor, inicia sesión nuevamente.",
          });
          router.back();
          return;
        }

        const examDetail = await getExamById(examId);
        setExamName(examDetail.name);

        const currentSubjectId = Number(examDetail.subject_id);
        setSubjectId(currentSubjectId);

        const examStudent = await getExamStudentById(
          examId,
          currentStudentId
        );
        setGlobalScore(examStudent.score);

        if (currentSubjectId) {
          const teachers = await getTeachersWithSubjects();
          const filtered = teachers.filter(
            (t) => t.subjects?.some((s) => s.id === currentSubjectId)
          );
          setAvailableTeachers(filtered);
        }
      } catch (error) {
        console.error(error);
        toast.error("Error de carga", {
          description:
            "No se pudo cargar la información necesaria para la recalificación.",
        });
        router.back();
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [examId, router]);

  // =========================================================
  // CONFIRMATION LOGIC
  // =========================================================
  const handleConfirmRecalification = async () => {
    setIsConfirming(false);

    if (!studentId || !examId || selectedTeacherId === null) return;

    setSubmitting(true);
    try {
      await postRecalificationRequest({
        exam_id: examId,
        student_id: studentId,
        teacher_id: selectedTeacherId,
      });

      toast.success("Solicitud enviada", {
        description: `Tu solicitud para "${examName}" fue enviada con éxito.`,
      });

      router.push(`/dashboard/student/exam_done/${examId}/review`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado.";

      toast.error("Error al enviar solicitud", {
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // SUBMIT BUTTON
  // =========================================================
  const handleReevaluationSubmit = () => {
    if (!studentId || !examId || selectedTeacherId === null) {
      toast.warning("Datos incompletos", {
        description: "Debes seleccionar un profesor.",
      });
      return;
    }

    if (globalScore !== null && globalScore <= 0) {
      toast.warning("Calificación inválida", {
        description:
          "Solo puedes solicitar recalificación si el examen tiene nota.",
      });
      return;
    }

    setIsConfirming(true);
  };

  // =========================================================
  // RENDER STATES
  // =========================================================
  if (loading) {
    return (
      <p className="p-8 flex items-center">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Cargando...
      </p>
    );
  }

  if (!subjectId) {
    return (
      <div className="p-8 text-center text-red-500">
        Error: No se pudo identificar la asignatura del examen.
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6">
        📝 Solicitar Recalificación
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>{examName}</CardTitle>
          <CardDescription>
            Selecciona el profesor que revisará tu examen.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Select
            onValueChange={(value) => setSelectedTeacherId(Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un profesor" />
            </SelectTrigger>
            <SelectContent>
              {availableTeachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id.toString()}>
                  {teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            className="w-full"
            onClick={handleReevaluationSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Confirmar Solicitud"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* DIALOG */}
      <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirmar Solicitud de Recalificación
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Confirmas la solicitud para el examen <b>{examName}</b>?
              <br />
              <br />
              Profesor:
              <b>
                {" "}
                {
                  availableTeachers.find(
                    (t) => t.id === selectedTeacherId
                  )?.name
                }
              </b>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRecalification}
              disabled={submitting}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* SONNER */}
      <Toaster />
    </div>
  );
}
