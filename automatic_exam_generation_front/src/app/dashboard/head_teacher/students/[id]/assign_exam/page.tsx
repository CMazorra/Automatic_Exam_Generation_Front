// src/app/dashboard/head_teacher/students/[id]/assign_exam/page.tsx

"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser } from "@/services/authService";
import { getExams, updateExamStatus } from "@/services/examService";
import { postExamStudent, getExamStudents } from "@/services/examStudentService"; // **VERIFICA ESTA RUTA**

// ASUMIMOS estas funciones de servicio
import { getSubjectsFlatByTeacherID } from "@/services/subjectService"; // 🎯 Añadido para obtener la lista del Jefe de Estudios

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

export default function AssignExamHeadTeacherPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { id } = use(params);
  const studentId = Number(id);
  // Asignaturas que cursa el estudiante (vienen de la URL de la vista de estudiante)
  const studentSubjectIds = searchParams.get("subjects")?.split(",").map(Number).filter(id => !isNaN(id)) || [];

  const [headTeacherId, setHeadTeacherId] = useState<number | null>(null);
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [commonSubjects, setCommonSubjects] = useState<Subject[]>([]); // Asignaturas en común con nombres
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const extractSubjects = (v: any): Subject[] => {
    if (v == null) return []
    if (Array.isArray(v)) return v
    if (typeof v === "object") {
      if (Array.isArray(v.subjects)) return v.subjects
    }
    // Convertir si el objeto solo tiene {id, name}
    if (v.id && v.name) return [v] 
    return []
  }

  // 1. Cargar Usuario Actual (Jefe de Estudios), sus asignaturas, y filtrar las asignaturas comunes.
  useEffect(() => {
    async function loadData() {
      try {
        const current = await getCurrentUser();
        const currentHeadTeacherId = current?.id || current?.id_us || current?.user?.id || null;
        setHeadTeacherId(currentHeadTeacherId);

        if (!currentHeadTeacherId) {
          alert("Error: No se pudo obtener el ID del Jefe de Estudios actual.");
          router.back();
          return;
        }

        // --- Lógica para obtener Asignaturas Comunes ---
        
        // A. Obtener asignaturas impartidas por el Jefe de Estudios
        const teacherSubjectsRaw = await getSubjectsFlatByTeacherID(String(currentHeadTeacherId));
        // Aseguramos que sea un array de objetos Subject
        const teacherSubjects: Subject[] = extractSubjects(teacherSubjectsRaw)
            .map(s => ({ id: Number(s.id), name: s.name || `ID ${s.id}` }));
            
        const teacherSubjectIds = teacherSubjects.map(s => Number(s.id));

        // B. Encontrar la intersección (Asignaturas que él imparte Y que el estudiante cursa)
        const commonSubjectObjects = teacherSubjects.filter(s =>
            studentSubjectIds.includes(Number(s.id))
        );
        
        setCommonSubjects(commonSubjectObjects);
        const commonSubjectIds = commonSubjectObjects.map(s => Number(s.id));


        // --- Lógica para obtener Exámenes Disponibles ---
        
        const allExams: Exam[] = await getExams();

        // Cargar asignaciones existentes y excluir las del estudiante actual
        const allExamStudents = await getExamStudents().catch(() => [] as any[]);
        const assignedExamIdsForStudent: number[] = Array.isArray(allExamStudents)
          ? allExamStudents
              .filter((es: any) => Number(es.student_id) === studentId)
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

        // Auto-seleccionar la primera asignatura si solo hay una
        if (commonSubjectObjects.length === 1) {
            setSelectedSubjectId(String(commonSubjectObjects[0].id));
        }

      } catch (e) {
        console.error("Error loading data:", e);
        alert("Error al cargar los datos de asignación.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router, studentSubjectIds]);


  const handleAssign = async () => {
    if (!selectedExamId || !headTeacherId) {
      alert("Selecciona un examen y asegúrate de que el Jefe de Estudios esté identificado.");
      return;
    }

    setIsSubmitting(true);
    try {
      const examId = Number(selectedExamId);
      const selectedExam = availableExams.find(e => e.id === examId);

      if (!selectedExam) {
        alert("Examen no encontrado en la lista disponible.");
        return;
      }

      // Ya se filtra arriba para no mostrar exámenes asignados

      // 1. CREAR LA ASIGNACIÓN (usando el ID del Jefe de Estudios como "teacher_id" de la asignación)
      await postExamStudent({
        score: 0,
        exam_id: examId,
        student_id: studentId,
        teacher_id: headTeacherId, 
      });

      // 2. ACTUALIZAR EL ESTADO DEL EXAMEN 
      try {
        await updateExamStatus(examId, "Asignado");
      } catch (statusError) {
        console.warn("La asignación se creó, pero falló la actualización del estado del examen:", statusError);
      }

      alert("Examen asignado y estado actualizado exitosamente.");
      // Redirigir de vuelta a la vista del estudiante del Jefe de Estudios
      router.push(`/dashboard/head_teacher/students/${studentId}`); 
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

  if (isLoading) return <p className="p-8 flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando datos...</p>;
  if (!headTeacherId) return <p className="p-8 text-destructive">Error de autenticación. Jefe de Estudios no identificado.</p>;
  if (commonSubjects.length === 0) return <p className="p-8 text-destructive">Error: El Jefe de Estudios no imparte ninguna de las asignaturas que cursa el estudiante.</p>;


  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-xl space-y-6 rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Asignar Examen a Estudiante ({studentId})</h2>
        <p className="text-sm text-muted-foreground">Selecciona la asignatura que impartes y el examen aprobado creado por ti.</p>

        {/* Selector de Asignatura (ahora usa nombres reales) */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Asignatura</label>
          <Select value={selectedSubjectId} onValueChange={(val) => {
            setSelectedSubjectId(val);
            setSelectedExamId(""); 
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una asignatura común" />
            </SelectTrigger>
            <SelectContent>
              {commonSubjects.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
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
                      {exam.name}
                    </SelectItem>
                  ))
                ) : (
                    <SelectItem key="no-exams" value="no-exams-placeholder" disabled>
                        No hay examenes a asignar.
                    </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedExamId || isSubmitting || examsForSelectedSubject.length === 0}
          >
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Asignando...</> : "Asignar Examen"}
          </Button>
        </div>
      </div>
    </main>
  );
}