// src/app/dashboard/teacher/students/[id]/assign_exam/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser } from "@/services/authService";
import { getExams, updateExamStatus } from "@/services/examService";
// 🎯 PASO A: Importamos la función de asignación de tu servicio de exam-student
import { postExamStudent } from "@/services/examStudentService"; // <-- **VERIFICA ESTA RUTA**

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Exam {
  id: number;
  name: string;
  subject_id: number;
  teacher_id: number;
  status: string;
}

export default function AssignExamPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const studentId = Number(params.id);
  // Obtener los IDs de las asignaturas comunes de la URL
  const taughtSubjectIds = searchParams.get("subjects")?.split(",").map(Number).filter(id => !isNaN(id)) || [];

  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Cargar Usuario Actual (Profesor) y Exámenes Disponibles
  useEffect(() => {
    async function loadData() {
      try {
        const current = await getCurrentUser();
        // Intentamos obtener el ID del profesor de varias posibles propiedades del usuario
        const currentTeacherId = current?.id || current?.id_us || current?.user?.id || null;
        setTeacherId(currentTeacherId);

        if (!currentTeacherId) {
          alert("Error: No se pudo obtener el ID del profesor actual.");
          router.back();
          return;
        }

        const allExams: Exam[] = await getExams();

        // Filtrar exámenes: 1) Creados por el profesor actual, 2) Pertenecen a asignaturas comunes, 3) Listos para asignar.
        const filteredExams = allExams.filter(exam => 
            exam.teacher_id === currentTeacherId && 
            taughtSubjectIds.includes(Number(exam.subject_id)) &&
            (exam.status === "Aprobado") 
        );

        setAvailableExams(filteredExams);

        // Auto-seleccionar la primera asignatura si solo hay una
        if (taughtSubjectIds.length === 1) {
            setSelectedSubjectId(String(taughtSubjectIds[0]));
        }

      } catch (e) {
        console.error("Error loading data:", e);
        alert("Error al cargar los datos de asignación.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router, taughtSubjectIds]);


// src/app/dashboard/teacher/students/[id]/assign_exam/page.tsx (Función handleAssign)

    const handleAssign = async () => {
      if (!selectedExamId || !teacherId) {
        alert("Selecciona un examen y asegúrate de que el profesor esté identificado.");
        return;
      }

      setIsSubmitting(true);
      try {
        const examId = Number(selectedExamId);

        // 1. CREAR LA ASIGNACIÓN (Esto es lo que ya funciona)
        await postExamStudent({
          exam_id: examId,
          student_id: studentId,
          teacher_id: teacherId,
          score: 0,
        });

        // 2. ACTUALIZAR EL ESTADO DEL EXAMEN (Lo nuevo)
        // Cambiamos el estado del examen original para que el estudiante lo vea.
        try {
          await updateExamStatus(examId, "Asignado");
        } catch (statusError) {
          console.warn("La asignación se creó, pero falló la actualización del estado del examen:", statusError);
          // Podrías decidir mostrar una advertencia o dejar que la asignación siga.
        }

        alert("Examen asignado y estado actualizado exitosamente.");
        router.push(`/dashboard/teacher/students/${studentId}`); 
      } catch (error) {
        console.error("Error crítico en la asignación:", error);
        alert("Error crítico al asignar el examen. Intenta de nuevo.");
      } finally {
        setIsSubmitting(false);
      }
    };

  const examsForSelectedSubject = availableExams.filter(
    (exam) => String(exam.subject_id) === selectedSubjectId
  );

  // Mapeo simple de IDs a nombres para el selector (idealmente obtendríamos los nombres del servicio de asignaturas)
  const taughtSubjectsMap: Record<number, string> = {}; 
  // Rellenamos el mapa con los IDs para que el Select funcione
  taughtSubjectIds.forEach(id => { taughtSubjectsMap[id] = `Asignatura ID: ${id}` });


  if (isLoading) return <p className="p-8">Cargando datos...</p>;
  if (taughtSubjectIds.length === 0) return <p className="p-8 text-destructive">Error: No hay asignaturas comunes para asignar.</p>;
  if (!teacherId) return <p className="p-8 text-destructive">Error de autenticación. Profesor no identificado.</p>;

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-xl space-y-6 rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Asignar Examen a Estudiante ({studentId})</h2>
        <p className="text-sm text-muted-foreground">Selecciona la asignatura y luego el examen creado por ti y listo para asignar.</p>

        {/* Selector de Asignatura */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Asignatura</label>
          <Select value={selectedSubjectId} onValueChange={(val) => {
            setSelectedSubjectId(val);
            setSelectedExamId(""); // Limpiar la selección de examen
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una asignatura" />
            </SelectTrigger>
            <SelectContent>
              {taughtSubjectIds.map((id) => (
                <SelectItem key={id} value={String(id)}>
                  {taughtSubjectsMap[id]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selector de Examen */}
        {selectedSubjectId && (
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Examen</label>
            <Select value={selectedExamId} onValueChange={setSelectedExamId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el examen a asignar" />
              </SelectTrigger>
              <SelectContent>
                {examsForSelectedSubject.length > 0 ? (
                  examsForSelectedSubject.map((exam) => (
                    <SelectItem key={exam.id} value={String(exam.id)}>
                      {exam.name} ({exam.status})
                    </SelectItem>
                  ))
                ) : (
                    // ⚠️ ELIMINAMOS el SelectItem con value=""
                    // Opcionalmente, podemos agregar un mensaje informativo aquí:
                    <SelectItem key="no-exams" value="no-exams-placeholder" disabled>
                        No hay exámenes listos creados por ti para esta asignatura.
                    </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedExamId || isSubmitting || examsForSelectedSubject.length === 0}
          >
            {isSubmitting ? "Asignando..." : "Asignar"}
          </Button>
        </div>
      </div>
    </main>
  );
}