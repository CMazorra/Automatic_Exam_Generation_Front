// app/dashboard/student/exam_to_do/[id]/answer/page.tsx

"use client"

import { useEffect, useState } from 'react';
import { getExamById } from '@/services/examService'; 
import { getQuestionById } from '@/services/questionService'; // Asume que existe
import { getCurrentUser } from '@/services/authService';
import { postStudentAnswers } from '@/services/answerService'; // Debe estar exportado
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useParams, useRouter } from 'next/navigation';
import { ChangeEvent } from 'react'; // Importamos ChangeEvent
import { updateExamStudent } from '@/services/examStudentService';

// Interfaces (basadas en tu estructura)
interface Question {
    id: number;
    question_text: string;
    type: 'Teórico' | 'Verdadero/Falso' | 'Opción Múltiple';
    difficulty: string;
    answers?: { id: number; answer_text: string; is_correct: boolean }[]; 
}

interface ExamDetail {
    id: number;
    name: string;
    exam_questions: { question_id: number }[];
}

export default function AnswerExamPage() {
    const params = useParams();
    const router = useRouter();
    const examId = Number(params.id);

    const [loading, setLoading] = useState(true);
    const [exam, setExam] = useState<ExamDetail | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<number, string>>({}); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [studentId, setStudentId] = useState<number | null>(null);

    // ... (El useEffect de carga se mantiene igual) ...
    useEffect(() => {
        if (!examId) return;

        async function loadExamData() {
            setLoading(true);
            try {
                const user = await getCurrentUser();
                const currentStudentId = user?.id ?? null;
                setStudentId(currentStudentId);

                if (!currentStudentId) return;

                const examDetail: ExamDetail = await getExamById(examId);
                setExam(examDetail);

                const questionIds = examDetail.exam_questions.map(eq => eq.question_id);
                const questionPromises = questionIds.map(id => getQuestionById(String(id)));
                const fullQuestions: Question[] = await Promise.all(questionPromises);
                
                setQuestions(fullQuestions);

            } catch (e) {
                console.error("Error al cargar el examen o preguntas:", e);
                alert("Error al cargar el examen. Inténtalo de nuevo.");
            } finally {
                setLoading(false);
            }
        }
        
        loadExamData();
    }, [examId]);


    const handleAnswerChange = (questionId: number, value: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value,
        }));
    };

    const renderAnswerInput = (q: Question) => {
        const currentAnswer = answers[q.id] || '';
        const inputName = `question-${q.id}`;

        const handleRadioChange = (e: ChangeEvent<HTMLInputElement>) => {
             // e.target.value SIEMPRE es un string, resolviendo el error de TS
            handleAnswerChange(q.id, e.target.value);
        };

        switch (q.type) {
            case 'Teórico':
                return (
                    <Textarea
                        placeholder="Escribe tu respuesta aquí..."
                        value={currentAnswer}
                        // Aquí ya estaba correcto
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        rows={6}
                    />
                );
            case 'Verdadero/Falso':
                return (
                    <div className="flex space-x-8">
                        {['Verdadero', 'Falso'].map(option => (
                            <div key={option} className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id={`${inputName}-${option}`}
                                    name={inputName}
                                    value={option}
                                    checked={currentAnswer === option}
                                    // CAMBIO CLAVE AQUÍ: Usamos el evento estándar
                                    onChange={handleRadioChange}
                                    className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                                />
                                <Label htmlFor={`${inputName}-${option}`}>{option}</Label>
                            </div>
                        ))}
                    </div>
                );
            case 'Opción Múltiple':
                return (
                    <div className="space-y-3">
                        {q.answers?.map(a => (
                            <div key={a.id} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
                                <input
                                    type="radio"
                                    id={`op-${a.id}`}
                                    name={inputName}
                                    // Guardamos el ID de la opción como string en el valor
                                    value={String(a.id)} 
                                    checked={currentAnswer === String(a.id)}
                                    // CAMBIO CLAVE AQUÍ: Usamos el evento estándar
                                    onChange={handleRadioChange}
                                    className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                                />
                                <Label htmlFor={`op-${a.id}`}>{a.answer_text}</Label>
                            </div>
                        ))}
                    </div>
                );
            default:
                return <p className="text-red-500">Tipo de pregunta no soportado.</p>;
        }
    };

    // ... (El handleSubmit se mantiene igual, ya que usa postStudentAnswers) ...
    const handleSubmit = async () => {
        if (!exam || !studentId) {
            alert("Error: No se pudo cargar el examen o identificar al estudiante.");
            return;
        }

        // ... (Creación del answersPayload, confirmación de preguntas no respondidas) ...

        const answersPayload = questions.map(q => ({
            question_id: q.id,
            answer_text: answers[q.id] || "", 
            exam_id: exam.id,
            student_id: studentId, 
        }));

        // ... (Confirmación si hay preguntas vacías) ...

        setIsSubmitting(true);
        try {
            // 1. Guardar todas las respuestas
            await postStudentAnswers(answersPayload);
            
            // 2. Marcar el examen como ENVIADO/PENDIENTE DE CALIFICACIÓN (score: -1)
            const scorePayload = { score: -1 }; 
            await updateExamStudent(exam.id, studentId, scorePayload);
            
            alert("Examen enviado con éxito. Pendiente de Calificación.");
            
            router.push('/dashboard/student/exam_done'); 
            
        } catch (e) {
            console.error("Error al enviar el examen:", e);
            alert("Error al enviar el examen. Inténtalo de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (loading) {
        return <p className="p-8">Cargando examen...</p>;
    }
    
    if (!exam || questions.length === 0) {
        return <p className="p-8 text-red-500">Error: No se pudo cargar el examen o no contiene preguntas.</p>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold mb-2">Realizar Examen: {exam.name}</h1>
            <p className="text-xl text-muted-foreground mb-8">Responde cada pregunta a continuación y envíalo al finalizar.</p>

            <div className="space-y-10">
                {questions.map((q, index) => (
                    <Card key={q.id}>
                        <CardHeader>
                            <CardTitle className="text-xl">
                                {index + 1}. {q.question_text} <span className='text-sm font-normal text-muted-foreground'>({q.type})</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {renderAnswerInput(q)}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-10 pt-6 border-t flex justify-end">
                <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    size="lg"
                >
                    {isSubmitting ? 'Enviando Respuestas...' : 'Finalizar y Enviar Examen'}
                </Button>
            </div>
        </div>
    );
}