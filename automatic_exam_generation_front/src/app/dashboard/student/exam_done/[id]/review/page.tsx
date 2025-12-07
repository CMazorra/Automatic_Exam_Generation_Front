"use client"

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/services/authService';
import { getExamById } from '@/services/examService';
import { getQuestionById } from '@/services/questionService'; 
import { getAnswerById } from '@/services/answerService'; 
import { getExamStudentById } from '@/services/examStudentService';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; 
import { useParams, useRouter } from 'next/navigation';   // <-- AÑADIDO
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// ------------------------------------------------------------

interface ExamStudentResult {
    score: number;
}

interface StudentAnswerResult {
    answer_text: string;
}

interface QuestionDetail {
    id: number;
    question_text: string;
    type: 'Teórico' | 'Verdadero/Falso' | 'Opción Múltiple';
    correct_answer?: string;
    max_score: number;
}

interface ReviewQuestion extends QuestionDetail {
    student_answer: string;
    is_correct_calculated: boolean | null;
}

// ------------------------------------------------------------

const AnswerDisplay = ({ label, answer, isCorrect, showIcon = true }: { 
    label: string, 
    answer: string, 
    isCorrect?: boolean | null, 
    showIcon?: boolean 
}) => {

    let colorClass = "";
    let icon = null;

    if (isCorrect === true) {
        colorClass = "bg-green-50 border-green-200 text-green-800";
        icon = <Check className="h-5 w-5 mr-2" />;
    } else if (isCorrect === false) {
        colorClass = "bg-red-50 border-red-200 text-red-800";
        icon = <X className="h-5 w-5 mr-2" />;
    } else {
        colorClass = "bg-blue-50 border-blue-200 text-blue-800";
        icon = null;
    }

    return (
        <div className={`p-4 border rounded-lg ${colorClass} mt-2`}>
            <div className="font-semibold text-sm mb-1 flex items-center">
                {showIcon && icon}
                {label}
            </div>
            <p className="whitespace-pre-wrap">{answer || "N/A"}</p>
        </div>
    );
};

// ------------------------------------------------------------

export default function ExamReviewPage() {
    const params = useParams();
    const examId = Number(params.id);
    const router = useRouter();   // <-- AÑADIDO

    const [loading, setLoading] = useState(true);
    const [reviewQuestions, setReviewQuestions] = useState<ReviewQuestion[]>([]);
    const [examName, setExamName] = useState('Revisión de Examen');
    const [globalScore, setGlobalScore] = useState<number | null>(null);
    const [maxTotalScore, setMaxTotalScore] = useState(0);

    // ------------------------------------------------------------

    const handleRecalificacionClick = () => {
        router.push(`/dashboard/student/recalification/${examId}`);   // <-- NUEVA FUNCIÓN
    };

    // ------------------------------------------------------------

    useEffect(() => {
        if (!examId) return;

        async function loadReviewData() {
            setLoading(true);
            try {
                const user = await getCurrentUser();
                const studentId = user?.id ?? null;

                if (!studentId) return;

                const examStudent: ExamStudentResult = await getExamStudentById(examId, studentId);
                setGlobalScore(examStudent.score);

                const examDetail: any = await getExamById(examId);
                setExamName(examDetail.name);
                const questionLinks = examDetail.exam_questions;

                let calculatedMaxScore = 0;
                const reviewPromises = questionLinks.map(async (link: { question_id: number }) => {
                    const qId = link.question_id;

                    const question: QuestionDetail = await getQuestionById(String(qId));
                    calculatedMaxScore += question.max_score;

                    const studentAnswerResult: StudentAnswerResult = await getAnswerById(examId, qId, studentId);

                    const isCorrect = (
                        question.type !== 'Teórico'
                            ? (studentAnswerResult.answer_text === question.correct_answer)
                            : null
                    );

                    return {
                        ...question,
                        student_answer: studentAnswerResult.answer_text,
                        is_correct_calculated: isCorrect,
                    } as ReviewQuestion;
                });

                const fullReview = await Promise.all(reviewPromises);
                setReviewQuestions(fullReview);
                setMaxTotalScore(calculatedMaxScore);

            } catch (e) {
                console.error("Error al cargar la revisión del examen:", e);
                alert("Error al cargar la revisión.");
            } finally {
                setLoading(false);
            }
        }

        loadReviewData();
    }, [examId]);

    // ------------------------------------------------------------

    if (loading) {
        return <p className="p-8">Cargando revisión del examen...</p>;
    }

    const isPending = globalScore === -1;
    const isCalificado = globalScore !== -1 && globalScore !== 0;

    // ------------------------------------------------------------

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold mb-2">{examName}</h1>

            <Card className='mb-8'>
                <CardHeader>
                    <CardTitle>Resultado Final</CardTitle>
                    <CardDescription>
                        {isPending 
                            ? "Este examen está pendiente de calificación manual." 
                            : "Revisión de respuestas y calificación obtenida."}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {isPending ? (
                        <Badge variant="secondary" className="text-xl py-1 px-3">
                            PENDIENTE DE REVISIÓN
                        </Badge>
                    ) : (
                        <p className="text-3xl font-bold">
                            Puntuación Total: <span className="text-primary">{globalScore}</span> / {maxTotalScore}
                        </p>
                    )}

                    {isCalificado && (
                        <Button 
                            className="mt-4"
                            onClick={handleRecalificacionClick}   // <-- NUEVO
                        >
                            Solicitar Recalificación
                        </Button>
                    )}
                </CardContent>
            </Card>

            <h2 className="text-2xl font-bold mb-6">Detalle de Preguntas</h2>

            <div className="space-y-8">
                {reviewQuestions.map((q, index) => (
                    <Card key={q.id}>
                        <CardHeader className="flex flex-row justify-between items-start">
                            <CardTitle className="text-xl">
                                {index + 1}. {q.question_text}
                            </CardTitle>
                            <Badge variant="secondary" className="text-md py-1">
                                Valor Máximo: {q.max_score} puntos
                            </Badge>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <AnswerDisplay
                                label="Tu Respuesta"
                                answer={q.student_answer}
                                isCorrect={q.is_correct_calculated}
                                showIcon={q.type !== 'Teórico' && !isPending}
                            />

                            {!isPending && q.type !== 'Teórico' && q.correct_answer && (
                                <AnswerDisplay
                                    label="Respuesta Correcta"
                                    answer={q.correct_answer}
                                    isCorrect={true}
                                    showIcon={false}
                                />
                            )}

                            {q.type === 'Teórico' && (
                                <p className="text-sm text-muted-foreground">
                                    Pregunta de desarrollo. Calificación manual.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
