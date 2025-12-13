'use client';

import { useEffect, useState } from 'react';
import { getCompareExams } from '@/services/reportService';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Check, X } from 'lucide-react';

interface TopicDistribution {
  topicName: string;
  count: number;
  percentage: number;
  [key: string]: string | number; 
}

interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
  difficultyScore: number;
}

interface ExamSummary {
  examId: number;
  examName: string;
  totalQuestions: number;
  difficultyDistribution: DifficultyDistribution;
  topicDistribution: TopicDistribution[];
  subtopicVariey: number;
  metrics: {
    difficultyScore: number;
    topicEntropy: number;
    subtopicVarietyScore: number;
  };
  balanced: {
    difficulty: boolean;
    topic: boolean;
    subtopic: boolean;
  };
  parameters: {
    id: number;
    proportion: string;
    amount_quest: string;
    quest_topics: string;
  };
}

interface SubjectData {
  subjectId: number;
  subjectName: string;
  examSummaries: ExamSummary[];
  subjectBalanceScore: number;
}

interface CompareExamsData {
  subjects: SubjectData[];
}

export default function CompareExamsPage() {
  const [data, setData] = useState<CompareExamsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedExam, setSelectedExam] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getCompareExams();
        setData(response);
        setError(null);
      } catch (err) {
        setError('Error al cargar la comparación de exámenes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Cargando datos...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-red-600">{error || 'No hay datos disponibles'}</p>
      </div>
    );
  }

  // Filtrar datos
  const filteredSubjects = selectedSubject === 'all'
    ? data.subjects
    : data.subjects.filter(s => s.subjectName === selectedSubject);

  // Aplanar todos los exámenes
  const allExams = data.subjects.flatMap(s =>
    s.examSummaries.map(e => ({
      ...e,
      subjectName: s.subjectName,
      subjectId: s.subjectId,
    }))
  );

  // KPIs
  const totalSubjects = data.subjects.filter(s => s.examSummaries.length > 0).length;
  const totalExams = allExams.length;
  const balancedExams = allExams.filter(e =>
    e.balanced.difficulty && e.balanced.topic && e.balanced.subtopic
  ).length;
  const avgBalanceScore = totalExams > 0
    ? Math.round(
        (data.subjects.reduce((sum, s) => sum + s.subjectBalanceScore, 0) / data.subjects.length) * 100
      )
    : 0;
  const bestSubject = data.subjects
    .filter(s => s.examSummaries.length > 0)
    .sort((a, b) => b.subjectBalanceScore - a.subjectBalanceScore)[0];

  // Datos para gráfico de barras apiladas - Distribución de dificultad
  const difficultyStackedData = filteredSubjects.flatMap(subject =>
    subject.examSummaries.map(exam => ({
      name: `${exam.examName}`,
      subject: subject.subjectName,
      Fácil: exam.difficultyDistribution.easy,
      Medio: exam.difficultyDistribution.medium,
      Difícil: exam.difficultyDistribution.hard,
    }))
  );

  // Datos para gráfico de radar - Métricas por asignatura
  const radarData = filteredSubjects
    .filter(s => s.examSummaries.length > 0)
    .map(subject => ({
      subject: subject.subjectName,
      'Dif. Score': Math.round(
        (subject.examSummaries.reduce((sum, e) => sum + e.metrics.difficultyScore, 0) /
          subject.examSummaries.length) *
          100
      ),
      'Topic Entropy': Math.round(
        (subject.examSummaries.reduce((sum, e) => sum + e.metrics.topicEntropy, 0) /
          subject.examSummaries.length) *
          100
      ),
      'Subtopic Variety': Math.round(
        (subject.examSummaries.reduce((sum, e) => sum + e.metrics.subtopicVarietyScore, 0) /
          subject.examSummaries.length) *
          100
      ),
    }));

  // Datos para gráfico circular (examen seleccionado)
  const selectedExamData = selectedExam
    ? allExams.find(e => e.examId === selectedExam)
    : null;

  const COLORS = {
    easy: '#10b981',
    medium: '#f59e0b',
    hard: '#ef4444',
    topics: ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#10b981'],
  };

  return (
    <div className="w-full p-6 space-y-6">
      {/* Toolbar */}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            document.documentElement.classList.add('pdf-override');
            window.print();
            setTimeout(() => {
              document.documentElement.classList.remove('pdf-override');
            }, 0);
          }}
        >
          Imprimir
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Comparación de Exámenes</h1>
        <p className="text-gray-600">
          Análisis de distribución de preguntas y cumplimiento de criterios de equilibrio
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Asignaturas Analizadas</p>
          <p className="text-2xl font-bold text-blue-600">{totalSubjects}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Exámenes Equilibrados</p>
          <p className="text-2xl font-bold text-green-600">
            {balancedExams}/{totalExams}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Balance Promedio</p>
          <p className="text-2xl font-bold text-purple-600">{avgBalanceScore}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Mejor Asignatura</p>
          <p className="text-lg font-bold text-orange-600 truncate">
            {bestSubject?.subjectName || 'N/A'}
          </p>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Filtrar por Asignatura</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas las asignaturas</option>
              {data.subjects
                .filter(s => s.examSummaries.length > 0)
                .map(subject => (
                  <option key={subject.subjectId} value={subject.subjectName}>
                    {subject.subjectName}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Ver Distribución de Temas</label>
            <select
              value={selectedExam || ''}
              onChange={(e) => setSelectedExam(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecciona un examen</option>
              {allExams.map(exam => (
                <option key={exam.examId} value={exam.examId}>
                  {exam.examName} ({exam.subjectName})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Tabla Resumen por Asignatura */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Resumen por Asignatura</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="bg-gray-50">
                <th className="text-left p-3 font-semibold">Asignatura</th>
                <th className="text-center p-3 font-semibold">Exámenes</th>
                <th className="text-center p-3 font-semibold">Puntuación Balance</th>
                <th className="text-center p-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects
                .filter(s => s.examSummaries.length > 0)
                .map(subject => {
                  const isBalanced = subject.subjectBalanceScore >= 0.7;
                  return (
                    <tr key={subject.subjectId} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{subject.subjectName}</td>
                      <td className="text-center p-3">{subject.examSummaries.length}</td>
                      <td className="text-center p-3">
                        <Badge className="bg-blue-100 text-blue-800">
                          {Math.round(subject.subjectBalanceScore * 100)}%
                        </Badge>
                      </td>
                      <td className="text-center p-3">
                        <Badge
                          className={
                            isBalanced ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {isBalanced ? 'Equilibrado' : 'Revisar'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Gráfico de Barras Apiladas - Distribución de Dificultad */}
      {difficultyStackedData.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Distribución de Dificultad por Examen</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={difficultyStackedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Fácil" stackId="a" fill={COLORS.easy} />
              <Bar dataKey="Medio" stackId="a" fill={COLORS.medium} />
              <Bar dataKey="Difícil" stackId="a" fill={COLORS.hard} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Gráficos Radar y Circular */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de Radar - Métricas */}
        {radarData.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Métricas de Equilibrio por Asignatura</h2>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Radar
                  name="Dif. Score"
                  dataKey="Dif. Score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Topic Entropy"
                  dataKey="Topic Entropy"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Subtopic Variety"
                  dataKey="Subtopic Variety"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Gráfico Circular - Distribución de Temas */}
        {selectedExamData && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">
              Distribución de Temas - {selectedExamData.examName}
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={selectedExamData.topicDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => {
                    const data = entry.payload || entry;
                    return `${data.topicName}: ${data.percentage}%`;
                    }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="topicName"
                >
                  {selectedExamData.topicDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.topics[index % COLORS.topics.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Heatmap de Cumplimiento - Matriz */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Matriz de Cumplimiento de Criterios</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead className="border-b">
              <tr className="bg-gray-50">
                <th className="text-left p-3 font-semibold sticky left-0 bg-gray-50">Examen</th>
                <th className="p-3 font-semibold">Asignatura</th>
                <th className="p-3 font-semibold">Total Preg.</th>
                <th className="p-3 font-semibold bg-green-50">Dificultad</th>
                <th className="p-3 font-semibold bg-blue-50">Tema</th>
                <th className="p-3 font-semibold bg-purple-50">Subtema</th>
                <th className="p-3 font-semibold">Balance Global</th>
              </tr>
            </thead>
            <tbody>
              {allExams.map(exam => {
                const isFullyBalanced =
                  exam.balanced.difficulty && exam.balanced.topic && exam.balanced.subtopic;
                return (
                  <tr key={exam.examId} className="border-b hover:bg-gray-50">
                    <td className="text-left p-3 font-medium sticky left-0 bg-white">
                      {exam.examName}
                    </td>
                    <td className="p-3">{exam.subjectName}</td>
                    <td className="p-3">{exam.totalQuestions}</td>
                    <td
                      className="p-3"
                      style={{
                        backgroundColor: exam.balanced.difficulty
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(239, 68, 68, 0.2)',
                      }}
                    >
                      {exam.balanced.difficulty ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-600 mx-auto" />
                      )}
                    </td>
                    <td
                      className="p-3"
                      style={{
                        backgroundColor: exam.balanced.topic
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(239, 68, 68, 0.2)',
                      }}
                    >
                      {exam.balanced.topic ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-600 mx-auto" />
                      )}
                    </td>
                    <td
                      className="p-3"
                      style={{
                        backgroundColor: exam.balanced.subtopic
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(239, 68, 68, 0.2)',
                      }}
                    >
                      {exam.balanced.subtopic ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-600 mx-auto" />
                      )}
                    </td>
                    <td className="p-3">
                      <Badge
                        className={
                          isFullyBalanced
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {isFullyBalanced ? 'Equilibrado' : 'Parcial'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Tabla Detallada con Parámetros */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Detalle de Parámetros y Distribución</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="bg-gray-50">
                <th className="text-left p-3 font-semibold">Examen</th>
                <th className="text-left p-3 font-semibold">Proporción</th>
                <th className="text-center p-3 font-semibold">Cant. Preg.</th>
                <th className="text-left p-3 font-semibold">Tipo</th>
                <th className="text-left p-3 font-semibold">Dificultad (F/M/D)</th>
                <th className="text-center p-3 font-semibold">Score Dif.</th>
              </tr>
            </thead>
            <tbody>
              {allExams.map(exam => (
                <tr key={exam.examId} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{exam.examName}</td>
                  <td className="p-3 text-xs">{exam.parameters.proportion}</td>
                  <td className="text-center p-3">{exam.parameters.amount_quest}</td>
                  <td className="p-3">{exam.parameters.quest_topics}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        {exam.difficultyDistribution.easy}
                      </Badge>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {exam.difficultyDistribution.medium}
                      </Badge>
                      <Badge className="bg-red-100 text-red-800">
                        {exam.difficultyDistribution.hard}
                      </Badge>
                    </div>
                  </td>
                  <td className="text-center p-3">
                    {Math.round(exam.difficultyDistribution.difficultyScore * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {/* Print styles scoped */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable, .printable * { visibility: visible; }
          .printable { position: absolute; left: 0; top: 0; width: 100%; }
          @page { size: A4 portrait; margin: 10mm; }
        }
      `}</style>
    </div>
  );
}