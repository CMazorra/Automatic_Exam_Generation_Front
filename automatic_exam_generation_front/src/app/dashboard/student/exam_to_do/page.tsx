// app/dashboard/student/exam_to_do/page.tsx
"use client"

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/services/authService';
import { getExams } from '@/services/examService';
import { Button } from '@/components/ui/button';
import { getAnswers } from '@/services/answerService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface ExamStudent {
    score: number;
    exam_id: number;
    student_id: number;
    teacher_id: number;
}

interface Exam {
    id: number;
    name: string;
    status: string;
    difficulty: string;
    subject: { name: string };
    exam_students: ExamStudent[];
}

// Interfaz para las respuestas para facilitar el tipado en el filtro
interface Answer {
    exam_id: number;
    student_id: number;
}

export default function ExamsToDoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [examsPendientes, setExamsPendientes] = useState<Exam[]>([]);

    useEffect(() => {
        async function loadExams() {
            setLoading(true);
            try {
                const user = await getCurrentUser();
                const currentStudentId = user?.id ?? null;

                if (!currentStudentId) return;

                const [allExamsData, allAnswersData] = await Promise.all([
                    getExams(),
                    getAnswers(), // 🔑 Obtener todas las respuestas
                ]);
                
                const allExams: Exam[] = Array.isArray(allExamsData) ? allExamsData : [];
                const allAnswers: Answer[] = Array.isArray(allAnswersData) ? allAnswersData : [];

                const pendientes: Exam[] = [];

                allExams.forEach(exam => {
                    const studentRecord = exam.exam_students.find(es => es.student_id === currentStudentId);
                    
                    // 🔑 NUEVA LÓGICA DE FILTRADO: Verificar si el estudiante ya tiene respuestas enviadas
                    const hasAnswered = allAnswers.some(
                        (answer: Answer) => 
                            answer.exam_id === exam.id && 
                            answer.student_id === currentStudentId
                    );

                    // Un examen está "TO DO" (Pendiente de hacer) si:
                    // 1. Está asignado al estudiante (existe studentRecord)
                    // 2. El status es "Asignado" (para evitar exámenes cancelados/finalizados)
                    // 3. El estudiante AÚN NO ha respondido (¡hasAnswered es false!)
                    if (studentRecord && exam.status === "Asignado" && !hasAnswered) {
                        pendientes.push(exam);
                    }
                    
                    // Nota: Ya no necesitamos studentRecord.score === 0 aquí, 
                    // ya que la falta de respuestas es el indicador principal de 'TO DO'.
                });
                
                setExamsPendientes(pendientes);

            } catch (e) {
                console.error("Error al cargar exámenes pendientes:", e);
            } finally {
                setLoading(false);
            }
        }
        
        loadExams();
    }, []);

    if (loading) return <p className="p-8">Cargando exámenes asignados...</p>;

    if (examsPendientes.length === 0) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-semibold">Exámenes Asignados</h2>
                <p className="mt-4 text-muted-foreground">¡No tienes exámenes pendientes! 🎉</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-6">
                📝 Exámenes Asignados ({examsPendientes.length})
            </h2>

            <div className="space-y-4">
                {examsPendientes.map(exam => (
                    <Card key={exam.id}>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center text-lg">
                                {exam.name}
                                <span className="text-sm font-normal text-muted-foreground">
                                    {exam.subject.name}
                                </span>
                            </CardTitle>
                            <CardDescription>
                                Dificultad: **{exam.difficulty}** | Estado: **{exam.status}**
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="flex justify-end pt-0">
                            <Button 
                                onClick={() => router.push(`/dashboard/student/exam_to_do/${exam.id}/answer`)}
                            >
                                Realizar Examen
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
