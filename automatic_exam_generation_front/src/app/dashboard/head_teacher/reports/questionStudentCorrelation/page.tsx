'use client';

import { useEffect, useState } from 'react';
import {
  getWorstQuestions,
  getDifficultyPerformanceCorrelation,
  getReevaluationComparison,
} from '@/services/reportService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface WorstQuestion {
  questionId: number;
  questionText: string;
  difficulty: string;
  subject: string;
  teacher: string;
  totalAnswers: number;
  averageScore: number;
  answers: any[];
}

interface Correlation {
  subjectId: number;
  subjectName: string;
  correlation: number;
  difficultyValues: number[];
  performanceValues: number[];
  totalSamples: number;
}

interface ReevaluationData {
  [studentName: string]: {
    [subjectName: string]: {
      examId: number;
      originalScore: number;
      recalifiedScore: number;
      subjectAverage: number;
      diffBefore: number;
      diffAfter: number;
    }[];
  };
}

export default function QuestionStudentCorrelationPage() {
  const [worstQuestions, setWorstQuestions] = useState<WorstQuestion[]>([]);
  const [correlations, setCorrelations] = useState<Correlation[]>([]);
  const [reevaluations, setReevaluations] = useState<ReevaluationData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [worstQuestionsData, correlationData, reevaluationData] = await Promise.all([
          getWorstQuestions(),
          getDifficultyPerformanceCorrelation(),
          getReevaluationComparison(),
        ]);

        setWorstQuestions(Array.isArray(worstQuestionsData) ? worstQuestionsData : []);
        setCorrelations(Array.isArray(correlationData) ? correlationData : []);
        setReevaluations(reevaluationData || {});
        setError(null);
      } catch (err) {
        setError('Error al cargar los datos del reporte');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    const diffLower = difficulty?.toLowerCase() || '';
    if (diffLower === 'fácil') return { bg: 'bg-green-100', text: 'text-green-800', hex: '#10b981' };
    if (diffLower === 'medio') return { bg: 'bg-yellow-100', text: 'text-yellow-800', hex: '#f59e0b' };
    if (diffLower === 'difícil') return { bg: 'bg-red-100', text: 'text-red-800', hex: '#ef4444' };
    return { bg: 'bg-gray-100', text: 'text-gray-800', hex: '#6b7280' };
  };

  const getCorrelationStrength = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return { label: 'Fuerte', color: 'text-red-600' };
    if (abs >= 0.4) return { label: 'Moderada', color: 'text-yellow-600' };
    if (abs >= 0.2) return { label: 'Débil', color: 'text-green-600' };
    return { label: 'Muy Débil', color: 'text-gray-600' };
  };

  // Calcular tasa de reprobación basado en averageScore
  const calculateFailureRate = (question: WorstQuestion) => {
    // Calcular la tasa de reprobación: si el promedio es bajo, hay más reprobación
    // averageScore es el promedio de calificaciones, convertimos a tasa de fallo
    const failureRate = Math.max(0, Math.round((1 - question.averageScore) * 100));
    return failureRate;
  };

  // Top 10 preguntas con peor rendimiento
  const top10Worst = worstQuestions
    .slice(0, 10)
    .map((q, idx) => ({
      ...q,
      rank: idx + 1,
      failureRate: calculateFailureRate(q),
    }));

  // Datos para gráfico de barras de peores preguntas
  const worstQuestionsChartData = top10Worst
    .map(q => ({
      name: `Q${q.rank}`,
      failureRate: q.failureRate,
      question: q.questionText.substring(0, 30) + '...',
      color: getDifficultyColor(q.difficulty).hex,
    }))
    .reverse();

  // Filtrar correlaciones
  const filteredCorrelations = selectedSubject === 'all'
    ? correlations
    : correlations.filter(c => c.subjectName === selectedSubject);

  // Preparar datos de scatter para cada materia
  const scatterDataBySubject = filteredCorrelations.map(corr => ({
    subject: corr.subjectName,
    data: corr.difficultyValues.map((diff, idx) => ({
      difficulty: diff,
      performance: corr.performanceValues[idx] * 100,
    })),
    correlation: corr.correlation,
  }));

  // Preparar datos de recalificaciones
  const reevaluationChartData: any[] = [];
  Object.entries(reevaluations).forEach(([studentName, subjects]) => {
    Object.entries(subjects).forEach(([subjectName, exams]) => {
      exams.forEach(exam => {
        reevaluationChartData.push({
          student: studentName,
          subject: subjectName,
          original: exam.originalScore,
          recalified: exam.recalifiedScore,
          average: exam.subjectAverage,
        });
      });
    });
  });

  // KPIs
  const avgFailureRate = top10Worst.length > 0
    ? Math.round(top10Worst.reduce((sum, q) => sum + q.failureRate, 0) / top10Worst.length)
    : 0;
  const strongCorrelations = correlations.filter(c => Math.abs(c.correlation) >= 0.7).length;
  const totalReevaluations = reevaluationChartData.length;
  const avgImprovement = totalReevaluations > 0
    ? Math.round(
        reevaluationChartData.reduce((sum, r) => sum + (r.recalified - r.original), 0) / totalReevaluations
      )
    : 0;

  const difficultyLabels: { [key: number]: string } = {
    1: 'Fácil',
    2: 'Medio',
    3: 'Difícil',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div id="report-content" className="w-full p-6 space-y-6">
      <div className="flex justify-end gap-2 print:hidden">
        <Button
          onClick={() => {
            try {
              document.documentElement.classList.add('pdf-override');
              window.print();
            } finally {
              setTimeout(() => document.documentElement.classList.remove('pdf-override'), 1000);
            }
          }}
          variant="outline"
        >
          Imprimir
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Análisis de Correlación: Dificultad y Rendimiento</h1>
        <p className="text-gray-600">
          Análisis detallado de preguntas difíciles, correlación entre dificultad y rendimiento, y comparación de recalificaciones
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Tasa Promedio de Reprobación</p>
          <p className="text-2xl font-bold text-red-600">{avgFailureRate}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Correlaciones Fuertes</p>
          <p className="text-2xl font-bold text-orange-600">{strongCorrelations}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Recalificaciones</p>
          <p className="text-2xl font-bold text-blue-600">{totalReevaluations}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Mejora Promedio</p>
          <p className="text-2xl font-bold text-green-600">+{avgImprovement}</p>
        </Card>
      </div>

      {/* Sección 1: Top 10 Preguntas con Mayor Reprobación */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Top 10 Preguntas con Mayor Tasa de Reprobación</h2>

        {/* Gráfico de Barras */}
        {worstQuestionsChartData.length > 0 && (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Tasa de Reprobación por Pregunta</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={worstQuestionsChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" label={{ value: 'Tasa de Reprobación (%)', position: 'insideBottom', offset: -5 }} />
                <YAxis dataKey="name" type="category" width={50} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded shadow">
                          <p className="font-semibold">{payload[0].payload.question}</p>
                          <p className="text-red-600">Reprobación: {payload[0].value}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="failureRate" name="Tasa de Reprobación (%)" radius={[0, 8, 8, 0]}>
                  {worstQuestionsChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-xs text-muted-foreground">
              <p className="font-semibold mb-1">Leyenda:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li><span className="font-medium">Reprobación (%)</span>: 100 − promedio de calificación.</li>
                <li>Color de barra según dificultad (verde/amarillo/rojo).</li>
              </ul>
            </div>
          </Card>
        )}

        {/* Tabla Detallada */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Detalle de Preguntas</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="bg-gray-50">
                  <th className="text-center p-3 font-semibold">#</th>
                  <th className="text-left p-3 font-semibold">Pregunta</th>
                  <th className="text-left p-3 font-semibold">Dificultad</th>
                  <th className="text-left p-3 font-semibold">Materia</th>
                  <th className="text-left p-3 font-semibold">Profesor</th>
                  <th className="text-center p-3 font-semibold">Respuestas</th>
                  <th className="text-center p-3 font-semibold">Promedio</th>
                  <th className="text-center p-3 font-semibold">Reprobación</th>
                </tr>
              </thead>
              <tbody>
                {top10Worst.map((question) => {
                  const colors = getDifficultyColor(question.difficulty);
                  return (
                    <tr key={question.questionId} className="border-b hover:bg-gray-50">
                      <td className="text-center p-3 font-bold text-lg">#{question.rank}</td>
                      <td className="p-3 max-w-md">{question.questionText}</td>
                      <td className="p-3">
                        <Badge className={`${colors.bg} ${colors.text}`}>
                          {question.difficulty}
                        </Badge>
                      </td>
                      <td className="p-3">{question.subject}</td>
                      <td className="p-3">{question.teacher}</td>
                      <td className="text-center p-3">{question.totalAnswers}</td>
                      <td className="text-center p-3">{question.averageScore.toFixed(1)}</td>
                      <td className="text-center p-3">
                        <Badge className="bg-red-100 text-red-800">
                          {question.failureRate}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Sección 2: Correlación Dificultad-Rendimiento */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Correlación: Dificultad vs Rendimiento</h2>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">Todas las asignaturas</option>
            {correlations.map(c => (
              <option key={c.subjectId} value={c.subjectName}>
                {c.subjectName}
              </option>
            ))}
          </select>
        </div>

        {/* Tabla de Correlaciones */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Coeficientes de Correlación</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-semibold">Asignatura</th>
                  <th className="text-center p-3 font-semibold">Coeficiente</th>
                  <th className="text-center p-3 font-semibold">Fuerza</th>
                  <th className="text-center p-3 font-semibold">Muestras</th>
                  <th className="text-left p-3 font-semibold">Interpretación</th>
                </tr>
              </thead>
              <tbody>
                {filteredCorrelations.map((corr) => {
                  const strength = getCorrelationStrength(corr.correlation);
                  return (
                    <tr key={corr.subjectId} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{corr.subjectName}</td>
                      <td className="text-center p-3">
                        <span className={`font-bold ${strength.color}`}>
                          {corr.correlation.toFixed(3)}
                        </span>
                      </td>
                      <td className="text-center p-3">
                        <Badge className={corr.correlation < 0 ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                          {strength.label}
                        </Badge>
                      </td>
                      <td className="text-center p-3">{corr.totalSamples}</td>
                      <td className="p-3 text-sm">
                        {corr.correlation < 0
                          ? 'A mayor dificultad, menor rendimiento'
                          : 'A mayor dificultad, mayor rendimiento'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            <p className="font-semibold mb-1">Leyenda:</p>
            <ul className="list-disc ml-4 space-y-1">
              <li><span className="font-medium">Coeficiente</span>: relación entre dificultad y rendimiento (−1 a 1).</li>
              <li><span className="font-medium">Fuerza</span>: Muy Débil/ Débil/ Moderada/ Fuerte según |coef|.</li>
              <li>Signo negativo: a mayor dificultad, menor rendimiento.</li>
            </ul>
          </div>
        </Card>

        {/* Gráficos de Dispersión */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scatterDataBySubject.slice(0, 4).map((subjectData) => (
            <Card key={subjectData.subject} className="p-6">
              <h3 className="text-lg font-bold mb-2">{subjectData.subject}</h3>
              <p className="text-sm text-gray-600 mb-4">
                Correlación: <span className={getCorrelationStrength(subjectData.correlation).color + ' font-bold'}>
                  {subjectData.correlation.toFixed(3)}
                </span>
              </p>
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="difficulty"
                    name="Dificultad"
                    domain={[0, 4]}
                    ticks={[1, 2, 3]}
                    tickFormatter={(value) => difficultyLabels[value] || ''}
                  />
                  <YAxis type="number" dataKey="performance" name="Rendimiento" domain={[0, 100]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value: any, name: string) =>
                      name === 'performance' ? `${value.toFixed(1)}%` : difficultyLabels[value as number]
                    }
                  />
                  <Scatter data={subjectData.data} fill="#3b82f6" />
                </ScatterChart>
              </ResponsiveContainer>
              <div className="mt-3 text-xs text-muted-foreground">
                <ul className="list-disc ml-4 space-y-1">
                  <li>Eje X: dificultad (1=Fácil, 2=Medio, 3=Difícil).</li>
                  <li>Eje Y: rendimiento (% de acierto).</li>
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Sección 3: Comparación de Recalificaciones */}
      {reevaluationChartData.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Comparación de Recalificaciones</h2>

          {/* Gráfico de Barras Agrupadas */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Original vs Recalificado vs Promedio del Curso</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={reevaluationChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="student" angle={-45} textAnchor="end" height={100} />
                <YAxis label={{ value: 'Calificación', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="original" fill="#ef4444" name="Original" radius={[8, 8, 0, 0]} />
                <Bar dataKey="recalified" fill="#10b981" name="Recalificado" radius={[8, 8, 0, 0]} />
                <Bar dataKey="average" fill="#f59e0b" name="Promedio Curso" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-xs text-muted-foreground">
              <p className="font-semibold mb-1">Leyenda:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>Rojo: nota original. Verde: recalificada. Amarillo: promedio del curso.</li>
                <li>Las barras se muestran por estudiante; el eje Y es calificación.</li>
              </ul>
            </div>
          </Card>

          {/* Tabla de Recalificaciones */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Detalle de Recalificaciones</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-semibold">Estudiante</th>
                    <th className="text-left p-3 font-semibold">Materia</th>
                    <th className="text-center p-3 font-semibold">Original</th>
                    <th className="text-center p-3 font-semibold">Recalificado</th>
                    <th className="text-center p-3 font-semibold">Promedio Curso</th>
                    <th className="text-center p-3 font-semibold">Mejora</th>
                  </tr>
                </thead>
                <tbody>
                  {reevaluationChartData.map((rec, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{rec.student}</td>
                      <td className="p-3">{rec.subject}</td>
                      <td className="text-center p-3">
                        <Badge className="bg-red-100 text-red-800">{rec.original}</Badge>
                      </td>
                      <td className="text-center p-3">
                        <Badge className="bg-green-100 text-green-800">{rec.recalified}</Badge>
                      </td>
                      <td className="text-center p-3">{rec.average}</td>
                      <td className="text-center p-3">
                        <span className="font-bold text-green-600">
                          +{rec.recalified - rec.original}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <p className="font-semibold mb-1">Leyenda:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li><span className="font-medium">Mejora</span>: diferencia (Recalificado − Original).</li>
                <li><span className="font-medium">Promedio Curso</span>: referencia del rendimiento medio en la asignatura.</li>
              </ul>
            </div>
          </Card>
        </div>
      )}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #report-content, #report-content * { visibility: visible; }
          #report-content { position: absolute; left: 0; top: 0; width: 100%; }
          @page { size: A4; margin: 12mm; }
          .print:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}