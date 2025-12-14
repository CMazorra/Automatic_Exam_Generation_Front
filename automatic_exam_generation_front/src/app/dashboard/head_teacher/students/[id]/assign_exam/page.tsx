"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser } from "@/services/authService";
import { getExams, updateExamStatus } from "@/services/examService";
import { postExamStudent, getExamStudents } from "@/services/examStudentService";
import { getSubjectsFlatByTeacherID } from "@/services/subjectService";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface Exam {
  id: number;
  name: string;
  subject_id: number;
  teacher_id: number;
  status: string;
}

interface Subject {
  id: number | string;
  name: string;
}

export default function AssignExamHeadTeacherPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { id } = use(params);
  const studentId = Number(id);

  // Asignaturas que cursa el estudiante (desde la URL)
  const studentSubjectIds =
    searchParams
      .get("subjects")
      ?.split(",")
      .map(Number)
      .filter((id) => !isNaN(id)) || [];

  const [headTeacherId, setHeadTeacherId] = useState<number | null>(null);
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [commonSubjects, setCommonSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const extractSubjects = (v: any): Subject[] => {
    if (!v) return [];
    if (Array.isArray(v)) return v;
    if (typeof v === "object" && Array.isArray(v.subjects)) return v.subjects;
    if (v.id && v.name) return [v];
    return [];
  };

  // 🔹 Carga inicial
  useEffect(() => {
    async function loadData() {
      try {
        const current = await getCurrentUser();
        const currentHeadTeacherId =
          current?.id || current?.id_us || current?.user?.id || null;

        setHeadTeacherId(currentHeadTeacherId);

        if (!currentHeadTeacherId) {
          toast.error("Error de autenticación", {
            description:
              "No se pudo identificar al Jefe de Estudios actual.",
          });
          router.back();
          return;
        }

        // Asignaturas del Jefe de Estudios
        const teacherSubjectsRaw = await getSubjectsFlatByTeacherID(
          String(currentHeadTeacherId)
        );

        const teacherSubjects: Subject[] = extractSubjects(
          teacherSubjectsRaw
        ).map((s) => ({
          id: Number(s.id),
          name: s.name || `ID ${s.id}`,
        }));

        // Intersección con asignaturas del estudiante
        const commonSubjectObjects = teacherSubjects.filter((s) =>
          studentSubjectIds.includes(Number(s.id))
        );

        setCommonSubjects(commonSubjectObjects);
        const commonSubjectIds = commonSubjectObjects.map((s) =>
          Number(s.id)
        );

        // Exámenes
        const allExams: Exam[] = await getExams();

        const allExamStudents = await getExamStudents().catch(() => []);
        const assignedExamIdsForStudent: number[] = Array.isArray(
          allExamStudents
        )
          ? allExamStudents
              .filter(
                (es: any) => Number(es.student_id) === studentId
              )
              .map((es: any) => Number(es.exam_id))
          : [];

        // 🎯 FILTRADO CLAVE:
        // 1) Creados por el Jefe de Estudios/Profesor actual (Asumiendo que el Jefe de Estudios solo puede asignar sus propios exámenes, como un profesor normal)
        // O: Se puede cambiar el filtro para que el Jefe de Estudios pueda asignar CUALQUIER examen Aprobado que cubra la asignatura común. **Mantendremos la restricción de crear/asignar sus propios exámenes por coherencia con el rol de "Profesor/Jefe de Estudios".**

        const filteredExams = allExams.filter(exam =>
            // 1. Debe ser de una asignatura que el Jefe de Estudios imparte Y que el alumno cursa
            commonSubjectIds.includes(Number(exam.subject_id)) &&
            // 2. Debe estar Aprobado (listo para ser asignado)
          (exam.status === "Aprobado" || exam.status === "Asignado") &&
          // 3. No mostrar exámenes ya asignados al estudiante
          !assignedExamIdsForStudent.includes(Number(exam.id))
        );

        setAvailableExams(filteredExams);

        if (commonSubjectObjects.length === 1) {
          setSelectedSubjectId(String(commonSubjectObjects[0].id));
        }
      } catch (error) {
        console.error(error);
        toast.error("Error de carga", {
          description:
            "No se pudieron cargar los datos de asignación.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router, studentSubjectIds]);

  // 🔹 Asignar examen
  const handleAssign = async () => {
    if (!selectedExamId || !headTeacherId) {
      toast.error("Selección incompleta", {
        description: "Selecciona un examen válido.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const examId = Number(selectedExamId);

      await postExamStudent({
        score: 0,
        exam_id: examId,
        student_id: studentId,
        teacher_id: headTeacherId,
      });

      try {
        await updateExamStatus(examId, "Asignado");
      } catch {
        toast.warning("Advertencia", {
          description:
            "El examen se asignó, pero no se pudo actualizar su estado.",
        });
      }

      toast.success("Examen asignado", {
        description:
          "El examen fue asignado correctamente al estudiante.",
      });

      router.push(
        `/dashboard/head_teacher/students/${studentId}`
      );
    } catch (error) {
      console.error(error);
      toast.error("Error crítico", {
        description:
          "Ocurrió un error al asignar el examen.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const examsForSelectedSubject = availableExams.filter(
    (exam) => String(exam.subject_id) === selectedSubjectId
  );

  if (isLoading)
    return (
      <p className="p-8 flex items-center">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando
        datos...
      </p>
    );

  if (!headTeacherId)
    return (
      <p className="p-8 text-destructive">
        Error de autenticación.
      </p>
    );

  if (commonSubjects.length === 0)
    return (
      <p className="p-8 text-destructive">
        No impartes ninguna asignatura que curse el estudiante.
      </p>
    );

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-xl space-y-6 rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">
          Asignar Examen a Estudiante ({studentId})
        </h2>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Asignatura
          </label>
          <Select
            value={selectedSubjectId}
            onValueChange={(val) => {
              setSelectedSubjectId(val);
              setSelectedExamId("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una asignatura" />
            </SelectTrigger>
            <SelectContent>
              {commonSubjects.map((s) => (
                <SelectItem
                  key={s.id}
                  value={String(s.id)}
                >
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSubjectId && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Examen
            </label>
            <Select
              value={selectedExamId}
              onValueChange={setSelectedExamId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un examen" />
              </SelectTrigger>
              <SelectContent>
                {examsForSelectedSubject.length > 0 ? (
                  examsForSelectedSubject.map((exam) => (
                    <SelectItem
                      key={exam.id}
                      value={String(exam.id)}
                    >
                      {exam.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem
                    value="none"
                    disabled
                  >
                    No hay exámenes disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAssign}
            disabled={
              !selectedExamId ||
              isSubmitting ||
              examsForSelectedSubject.length === 0
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Asignando...
              </>
            ) : (
              "Asignar Examen"
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}
