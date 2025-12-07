// app/dashboard/student/recalification/[id]/page.tsx

"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCurrentUser } from '@/services/authService';
import { getReviewTeachers } from '@/services/teacherService';
import { postRecalificationRequest } from '@/services/answerService'; 
import { getExamStudentById } from '@/services/examStudentService'; 
import { getExamById } from '@/services/examService';

// Componentes de UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react'; 

interface Teacher {
    id: number;
    name: string;
}

export default function ReevaluationRequestPage() {
    const params = useParams();
    const router = useRouter();
    const examId = Number(params.id);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);
    const [globalScore, setGlobalScore] = useState<number | null>(null);
    const [examName, setExamName] = useState('Examen');

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

                // Obtener nombre del examen
                const examDetail: any = await getExamById(examId);
                setExamName(examDetail.name);
                
                // Obtener registro examen-estudiante
                const examStudent: any = await getExamStudentById(examId, currentStudentId);
                setGlobalScore(examStudent.score);

                // Obtener profesores revisores
                const teachers = await getReviewTeachers();
                setAvailableTeachers(teachers);

            } catch (e) {
                console.error("Error al cargar datos:", e);
                alert("Error al cargar la información necesaria para la recalificación.");
                router.back(); 
            } finally {
                setLoading(false);
            }
        }
        
        loadData();
    }, [examId, router]);


    /** --------------------------------------------------------
     *  ENVÍO DE SOLICITUD DE RE-CALIFICACIÓN
     *  - NO SE ENVÍA score (backend lo maneja en 0)
     * --------------------------------------------------------*/
    const handleReevaluationSubmit = async () => {
        if (!studentId || !examId || selectedTeacherId === null || globalScore === null) {
            alert("Datos incompletos. Asegúrate de seleccionar un profesor.");
            return;
        }

        // Validación de que el examen está calificado
        if (globalScore === -1 || globalScore === 0) {
            alert("Solo puedes solicitar recalificación si el examen ya fue calificado.");
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
            // ⚠️ NO ENVIAR score — el backend define score=0 cuando entra en reevaluación
            await postRecalificationRequest(examId, studentId, selectedTeacherId); 
            
            alert("✅ Solicitud de recalificación enviada con éxito. Serás notificado cuando se revise.");

            router.push(`/dashboard/student/exam_done/${examId}/review`);
        } catch (error) {
            console.error("Error al enviar solicitud de recalificación:", error);
            alert("❌ Error al enviar la solicitud. Verifica el servicio de backend.");
        } finally {
            setSubmitting(false);
        }
    };

    // PAGINAS DE ESTADO
    if (loading) {
        return <p className="p-8 flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando opciones de recalificación...</p>;
    }

    const isCalificado = globalScore !== -1 && globalScore !== 0 && globalScore !== null;

    if (!isCalificado) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-semibold text-red-500">Acceso Denegado</h2>
                <p className="mt-4 text-muted-foreground">Solo puedes solicitar recalificación para exámenes que ya han sido calificados.</p>
                <Button onClick={() => router.back()} className="mt-6">Volver</Button>
            </div>
        );
    }

    if (availableTeachers.length === 0) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-semibold">No Hay Revisores Disponibles</h2>
                <p className="mt-4 text-muted-foreground">En este momento no hay profesores disponibles para revisar tu examen.</p>
                <Button onClick={() => router.back()} className="mt-6">Volver</Button>
            </div>
        );
    }

    // VISTA PRINCIPAL
    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-extrabold mb-6">📝 Solicitar Recalificación</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Examen: {examName}</CardTitle>
                    <CardDescription>
                        Tu nota actual es: <span className="font-bold text-primary">{globalScore}</span>.
                        Selecciona el profesor que revisará tu examen.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            Seleccionar Profesor Revisor
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
                            "Confirmar Solicitud de Recalificación"
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
