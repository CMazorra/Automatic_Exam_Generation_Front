"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser } from "@/services/authService";
import { getExams, updateExamStatus } from "@/services/examService";
import { postExamStudent, getExamStudents } from "@/services/examStudentService";

// ASUMIMOS estas funciones de servicio
import { getSubjectsFlatByTeacherID } from "@/services/subjectService";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; // <-- Importamos TOAST

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

export default function AssignExamTeacherPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { id } = use(params);
  const studentId = Number(id);
  // Asignaturas que cursa el estudiante (vienen de la URL de la vista de estudiante)
  const studentSubjectIds = searchParams.get("subjects")?.split(",").map(Number).filter(id => !isNaN(id)) || [];

  const [TeacherId, setTeacherId] = useState<number | null>(null);
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
        const currentTeacherId = current?.id || current?.id_us || current?.user?.id || null;
        setTeacherId(currentTeacherId);

        if (!currentTeacherId) {
          toast.error("Error de Autenticación", {
            description: "No se pudo obtener el ID del Jefe de Estudios actual.",
          });
          router.back();
          return;
        }

        // --- Lógica para obtener Asignaturas Comunes ---
        
        // A. Obtener asignaturas impartidas por el Jefe de Estudios
        const teacherSubjectsRaw = await getSubjectsFlatByTeacherID(String(currentTeacherId));
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
        // 1) Creados por el Profesor actual
        const filteredExams = allExams.filter(exam =>
            // 1. Debe ser un examen creado por el profesor logeado
            exam.teacher_id === currentTeacherId && 
            // 2. Debe ser de una asignatura que el profesor imparte Y que el alumno cursa
            commonSubjectIds.includes(Number(exam.subject_id)) &&
            // 3. Debe estar Aprobado (listo para ser asignado)
          (exam.status === "Aprobado" || exam.status === "Asignado") &&
          // 4. No mostrar exámenes ya asignados al estudiante
          !assignedExamIdsForStudent.includes(Number(exam.id))
        );

// Líneas 119-125
        setAvailableExams(filteredExams);
        // Auto-seleccionar la primera asignatura si solo hay una
        if (commonSubjectObjects.length === 1) {
            setSelectedSubjectId(String(commonSubjectObjects[0].id));
        }

      } catch (e) {
        console.error("Error loading data:", e);
        toast.error("Error de Carga", {
          description: "Error al cargar los datos de asignación.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router, studentSubjectIds]);


  const handleAssign = async () => {
    if (!selectedExamId || !TeacherId) {
      toast.error("Validación Requerida", {
        description: "Selecciona un examen y asegúrate de que el Jefe de Estudios esté identificado.",
      });
      return;
    }
    
    const examId = Number(selectedExamId);
    const selectedExam = availableExams.find(e => e.id === examId);

    if (!selectedExam) {
      toast.error("Examen no Válido", {
        description: "El examen seleccionado no se encuentra en la lista disponible.",
      });
      return;
    }

    setIsSubmitting(true);
    
    const assignOperation = async () => {
      // 1. CREAR LA ASIGNACIÓN
      await postExamStudent({
        score: 0,
        exam_id: examId,
        student_id: studentId,
        teacher_id: TeacherId, 
      });

      // 2. ACTUALIZAR EL ESTADO DEL EXAMEN 
      try {
        await updateExamStatus(examId, "Asignado");
      } catch (statusError) {
        console.warn("La asignación se creó, pero falló la actualización del estado del examen:", statusError);
        // No es un error crítico para la promesa, solo se advierte.
      }
      
      router.push(`/dashboard/teacher/students/${studentId}`); 
      return "Examen asignado y estado actualizado exitosamente."; // Mensaje de éxito
    };

    toast.promise(assignOperation(), {
      loading: 'Asignando examen...',
      success: (message) => {
        setIsSubmitting(false);
        return message;
      },
      error: (error) => {
        console.error("Error crítico en la asignación:", error);
        setIsSubmitting(false);
        return error?.message || "Error crítico al asignar el examen. Intenta de nuevo.";
      },
    });
  };

  const examsForSelectedSubject = availableExams.filter(
    (exam) => String(exam.subject_id) === selectedSubjectId
  );

  if (isLoading) return <p className="p-8 flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando datos...</p>;
  if (!TeacherId) return <p className="p-8 text-destructive">Error de autenticación. Profesor no identificado.</p>;
  if (commonSubjects.length === 0) return <p className="p-8 text-destructive">Error: El Profesor no imparte ninguna de las asignaturas que cursa el estudiante.</p>;


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
                        No hay examenes disponibles para esta asignatura.
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