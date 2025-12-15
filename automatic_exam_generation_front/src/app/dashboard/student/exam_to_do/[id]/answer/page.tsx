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
import { toast } from 'sonner'

interface Question {
    id: number;
    question_text: string;
    // TIPOS CORREGIDOS: 'Argumentación' para el texto libre y 'Selección Múltiple'
    type: 'Argumentación' | 'VoF' | 'Selección Múltiple'; 
    difficulty: string;
    // Asegúrate que tu servicio getQuestionById trae las opciones en el campo 'answers' si es 'Selección Múltiple'
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
                toast.error('Error de Carga', {
                    description: 'No se pudo cargar el examen. Inténtalo nuevamente.',
                })
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
            handleAnswerChange(q.id, e.target.value);
        };

        switch (q.type) {
            // Utilizamos Textarea para Argumentación
            case 'Argumentación': 
            // case 'VoF':
            // AÑADIMOS 'Selección Múltiple' para que use el mismo input de texto
            case 'Selección Múltiple':
                return (
                    <Textarea
                        placeholder="Escribe tu respuesta aquí (por ejemplo, la letra de la opción correcta)..."
                        value={currentAnswer}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        rows={3} // Reducido a 3 filas, ya que es para una letra/texto corto
                    />
                );
                
            case 'VoF':
                // Este caso se mantiene con los radio buttons, ya que es un formato cerrado
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
                                    onChange={handleRadioChange}
                                    className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                                />
                                <Label htmlFor={`${inputName}-${option}`}>{option}</Label>
                            </div>
                        ))}
                    </div>
                );

            default:
                return <p className="text-red-500">Tipo de pregunta no soportado: {q.type}</p>;
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
            const scorePayload = { score: 0 }; 
            await updateExamStudent(exam.id, studentId, scorePayload);
            
            toast.success('Examen Enviado', {
                description: 'Tu examen ha sido enviado correctamente.',
            })
            
            router.push('/dashboard/student/exam_done'); 
            
        } catch (e) {
            console.error("Error al enviar el examen:", e);
            toast.error('Error al Enviar', {
                description: 'No se pudo enviar el examen. Inténtalo nuevamente.',
            })
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