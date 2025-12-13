// src/app/dashboard/teacher/students/[id]/assign_exam/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser } from "@/services/authService";
import { getExams, updateExamStatus } from "@/services/examService";
import { postExamStudent } from "@/services/examStudentService";

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


interface Exam {
  id: number;
  name: string;
  subject_id: number;
  teacher_id: number;
  status: string;
}

interface Subject {
    id: number; // Aseguramos que el ID de la asignatura sea un número
    name: string;
}

export default function AssignExamPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const studentId = Number(params.id);
  // Asignaturas que cursa el estudiante (vienen de la URL)
  const studentSubjectIds = searchParams.get("subjects")?.split(",").map(Number).filter(id => !isNaN(id)) || [];

  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [commonSubjects, setCommonSubjects] = useState<Subject[]>([]);
  
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);


    // 🔑 FUNCIÓN UNIFICADA: Igualamos la lógica de Head Teacher para asegurar el tipo Subject con ID numérico
    const extractSubjects = (v: any): Subject[] => {
        if (v == null) return []
        
        let rawSubjects: any[] = []
        if (Array.isArray(v)) {
            rawSubjects = v
        } else if (typeof v === "object" && Array.isArray(v.subjects)) {
            rawSubjects = v.subjects
        } else if (v.id && v.name) {
            rawSubjects = [v]
        }
        
        return rawSubjects.map((s: any) => ({ 
            id: Number(s.id), 
            name: s.name || `ID ${s.id}` 
        }));
    }


  // 1. Cargar Usuario Actual (Profesor), sus asignaturas y Exámenes Disponibles
  useEffect(() => {
    async function loadData() {
      try {
        const current = await getCurrentUser();
        const currentTeacherId = current?.id || current?.id_us || current?.user?.id || null;
        setTeacherId(currentTeacherId);

        if (!currentTeacherId) {
          alert("Error: No se pudo obtener el ID del profesor actual.");
          router.back();
          return;
        }

        // --- Obtener Asignaturas Comunes y Nombres ---
        // 1. Obtener todas las asignaturas que imparte el profesor actual
        const teacherSubjectsRaw = await getSubjectsFlatByTeacherID(String(currentTeacherId));
        
        // 🔑 USAMOS la función extractSubjects CORREGIDA para asegurar IDs numéricos
        const teacherSubjects: Subject[] = extractSubjects(teacherSubjectsRaw);
        
        // 2. Filtrar para obtener la intersección (asignaturas que él imparte Y que el estudiante cursa)
        const commonSubjectObjects = teacherSubjects.filter(s => 
            studentSubjectIds.includes(s.id) // s.id ya es un número gracias a extractSubjects
        );
        
        setCommonSubjects(commonSubjectObjects);
        const commonSubjectIds = commonSubjectObjects.map(s => s.id);


        // --- Obtener y Filtrar Exámenes ---
        const allExams: Exam[] = await getExams();

        // Filtrar exámenes: 1) Creados por el profesor, 2) Pertenecen a asignaturas comunes, 3) Listos para asignar.
        const filteredExams = allExams.filter(exam => 
            exam.teacher_id === currentTeacherId && 
            commonSubjectIds.includes(exam.subject_id) && // exam.subject_id es number, commonSubjectIds es array de number
            (exam.status === "Aprobado") 
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
      if (!selectedExamId || !teacherId) {
        alert("Selecciona un examen y asegúrate de que el profesor esté identificado.");
        return;
      }

      setIsSubmitting(true);
      try {
        const examId = Number(selectedExamId);

        // 1. CREAR LA ASIGNACIÓN
        await postExamStudent({
          exam_id: examId,
          student_id: studentId,
          teacher_id: teacherId,
          score: 0,
        });

        // 2. ACTUALIZAR EL ESTADO DEL EXAMEN (De 'Aprobado' a 'Asignado')
        try {
          await updateExamStatus(examId, "Asignado");
        } catch (statusError) {
          console.warn("La asignación se creó, pero falló la actualización del estado del examen:", statusError);
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


  if (isLoading) return <p className="p-8 flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando datos...</p>;
  if (commonSubjects.length === 0) return <p className="p-8 text-destructive">Error: No hay asignaturas comunes que impartas para asignar.</p>;
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
            <Select value={selectedExamId} onValueChange={setSelectedExamId} disabled={examsForSelectedSubject.length === 0}>
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
                        No hay exámenes Aprobados creados por ti para esta asignatura.
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
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Asignando...</> : "Asignar"}
          </Button>
        </div>
      </div>
    </main>
  );
}