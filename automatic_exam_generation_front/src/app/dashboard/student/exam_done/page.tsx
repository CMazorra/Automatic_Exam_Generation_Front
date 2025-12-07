// app/dashboard/student/exam_done/page.tsx
"use client"

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/services/authService';
import { getExams } from '@/services/examService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

// Interfaces (se mantienen igual)
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

export default function ExamsDonePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [examsRealizados, setExamsRealizados] = useState<Exam[]>([]);
    const [studentId, setStudentId] = useState<number | null>(null);

    useEffect(() => {
        // ... (La lógica de carga se mantiene igual) ...
        async function loadExams() {
            setLoading(true);
            try {
                const user = await getCurrentUser();
                const currentStudentId = user?.id ?? null;
                setStudentId(currentStudentId);

                if (!currentStudentId) return;

                const allExams: Exam[] = await getExams();
                const realizados: Exam[] = [];

                allExams.forEach(exam => {
                    const studentRecord = exam.exam_students.find(
                        es => es.student_id === currentStudentId
                    );

                    // Condición: Aparece en exam_students Y score != 0
                    if (studentRecord && studentRecord.score !== 0) {
                        (exam as any).studentScore = studentRecord.score;
                        realizados.push(exam);
                    }
                });

                setExamsRealizados(realizados);

            } catch (e) {
                console.error("Error al cargar exámenes realizados:", e);
            } finally {
                setLoading(false);
            }
        }

        loadExams();
    }, []);

    if (loading) {
        return <p className="p-8">Cargando historial de exámenes...</p>;
    }

    if (examsRealizados.length === 0) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-semibold">Exámenes Realizados</h2>
                <p className="mt-4 text-muted-foreground">Aún no has realizado ningún examen.</p>
            </div>
        );
    }

    // handleRecalificacion HA SIDO ELIMINADA

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-6">📚 Historial de Exámenes ({examsRealizados.length})</h2>
            <div className="space-y-4">
                {examsRealizados.map(exam => (
                    <Card key={exam.id}>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center text-lg">
                                {exam.name}
                                <span className="text-sm font-normal text-muted-foreground">
                                    {exam.subject.name}
                                </span>
                            </CardTitle>
                            <CardDescription>
                                Dificultad: {exam.difficulty}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="flex justify-between items-center pt-0">
                            <p className="text-xl font-bold">
                                {(exam as any).studentScore === -1 ? (
                                    <span className="text-orange-500">Pendiente de Revisión</span>
                                ) : (
                                    <>
                                        Nota:{" "}
                                        <span className="text-primary">
                                            {(exam as any).studentScore}
                                        </span>
                                    </>
                                )}
                            </p>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        router.push(`/dashboard/student/exam_done/${exam.id}/review`)
                                    }
                                >
                                    { (exam as any).studentScore === -1
                                        ? "Ver Estado"
                                        : "Ver Revisión"
                                    }
                                </Button>

                                {/* BOTÓN DE RECALIFICACIÓN ELIMINADO DE ESTA PÁGINA */}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}