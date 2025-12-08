// src/app/dashboard/student/recalification/[id]/page.tsx

"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCurrentUser } from '@/services/authService';
// Importamos la nueva función combinada
import { getTeachersWithSubjects } from '@/services/teacherService'; 
import { postRecalificationRequest } from '@/services/reevaluationService'; 
import { getExamStudentById } from '@/services/examStudentService'; 
import { getExamById } from '@/services/examService';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react'; 

interface Subject {
    id: number;
    name: string;
}

interface Teacher {
    id: number;
    name: string;
    // La función combinada nos da el array de subjects
    subjects?: Subject[]; 
}

export default function ReevaluationRequestPage() {
    const params = useParams();
    const router = useRouter();
    const examId = Number(params.id);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // El tipo debe reflejar la nueva interfaz Teacher (que incluye subjects)
    const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
    
    const [studentId, setStudentId] = useState<number | null>(null);
    const [globalScore, setGlobalScore] = useState<number | null>(null);
    const [examName, setExamName] = useState('Examen');
    const [subjectId, setSubjectId] = useState<number | null>(null);

    useEffect(() => {
        if (!examId) return;

        async function loadData() {
            setLoading(true);
            try {
                const user = await getCurrentUser();
                const currentStudentId = user?.id ?? null;
                setStudentId(currentStudentId);

                if (!currentStudentId) {
                    alert("Error: Usuario no identificado.");
                    router.back();
                    return;
                }

                // 1. Obtener datos del examen (incluye subject_id)
                const examDetail = await getExamById(examId);
                setExamName(examDetail.name);
                const currentSubjectId = Number(examDetail.subject_id);
                setSubjectId(currentSubjectId);

                // 2. Obtener nota actual
                const examStudent = await getExamStudentById(examId, currentStudentId);
                setGlobalScore(examStudent.score);

                // 3. Obtener TODOS los profesores con sus asignaturas
                if (currentSubjectId) {
                    const allTeachersWithSubjects: Teacher[] = await getTeachersWithSubjects();

                    // 4. FILTRAR en el Frontend por subject_id
                    const teachersForSubject = allTeachersWithSubjects.filter(t => 
                        t.subjects && t.subjects.some(s => s.id === currentSubjectId)
                    );
                    
                    setAvailableTeachers(teachersForSubject);
                } else {
                    console.warn("El examen no tiene un subject_id asociado.");
                }

            } catch (e) {
                console.error("Error al cargar datos:", e);
                alert("Error al cargar la información necesaria.");
                router.back(); 
            } finally {
                setLoading(false);
            }
        }
        
        loadData();
    }, [examId, router]);


    const handleReevaluationSubmit = async () => {
        if (!studentId || !examId || selectedTeacherId === null || globalScore === null) {
            alert("Datos incompletos. Selecciona un profesor.");
            return;
        }

        if (globalScore <= 0) {
            alert("Solo puedes solicitar recalificación si el examen ya tiene una nota válida.");
            return;
        }

        const teacherName = availableTeachers.find(t => t.id === selectedTeacherId)?.name || "Profesor seleccionado";

        if (!confirm(
            `¿Confirmas la solicitud de recalificación para el examen "${examName}" al profesor ${teacherName}?\n` +
            `Tu examen pasará a estado "Pendiente de Revisión".`
        )) {
            return;
        }

        setSubmitting(true);
        try {
            await postRecalificationRequest({
                exam_id: examId,
                student_id: studentId,
                teacher_id: selectedTeacherId
            });
            
            alert("✅ Solicitud enviada con éxito.");
            router.push(`/dashboard/student/exam_done/${examId}/review`);
        } catch (error) {
            console.error("Error al enviar solicitud:", error);
            alert("❌ Error al enviar la solicitud.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <p className="p-8 flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando...</p>;
    }

    if (!subjectId) {
         return <div className="p-8 text-center text-red-500">Error: No se pudo identificar la asignatura del examen.</div>;
    }

    if (availableTeachers.length === 0) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-semibold">No hay revisores disponibles</h2>
                <p className="mt-4 text-muted-foreground">
                    No encontramos profesores asignados a la asignatura de este examen.
                </p>
                <Button onClick={() => router.back()} className="mt-6">Volver</Button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-extrabold mb-6">📝 Solicitar Recalificación</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Examen: {examName}</CardTitle>
                    <CardDescription>
                        Nota actual: <span className="font-bold text-primary">{globalScore}</span>.
                        Selecciona un profesor de la asignatura correspondiente.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            Profesor Revisor
                        </label>

                        <Select
                            onValueChange={(value) => setSelectedTeacherId(Number(value))}
                            disabled={submitting}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Elige un profesor..." />
                            </SelectTrigger>

                            <SelectContent>
                                {availableTeachers.map(teacher => (
                                    <SelectItem key={teacher.id} value={String(teacher.id)}>
                                        {teacher.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleReevaluationSubmit}
                        disabled={submitting || selectedTeacherId === null}
                    >
                        {submitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            "Confirmar Solicitud"
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}