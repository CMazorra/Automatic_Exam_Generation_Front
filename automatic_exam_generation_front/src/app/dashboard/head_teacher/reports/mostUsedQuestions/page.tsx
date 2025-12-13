'use client';

import { useEffect, useState } from 'react';
import { getMostUsedQuestions } from '@/services/reportService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface MostUsedQuestion {
  usage_count: number;
  id: number;
  question_text: string;
  difficulty: string;
  subject: { name: string };
  sub_topic: {
    name: string;
    topic: { name: string };
  };
}

export default function MostUsedQuestionsPage() {
  const [questions, setQuestions] = useState<MostUsedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterMinUsage, setFilterMinUsage] = useState<number>(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getMostUsedQuestions();
        const questionsArray = Array.isArray(response) ? response : [response];
        setQuestions(questionsArray);
        setError(null);
      } catch (err) {
        setError('Error al cargar las preguntas más usadas');
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

  // Filtrar datos
  const filteredQuestions = questions.filter(
    (q) =>
      (filterDifficulty === 'all' || q.difficulty === filterDifficulty) &&
      q.usage_count >= filterMinUsage
  );

  // Datos para gráfico de barras (top 10)
  const chartData = filteredQuestions
    .slice(0, 10)
    .map((q) => ({
      name: q.question_text.substring(0, 30) + (q.question_text.length > 30 ? '...' : ''),
      uses: q.usage_count,
      difficulty: q.difficulty,
    }))
    .reverse();

  // Datos para gráfico circular de dificultad
  const difficultyData = [
    { name: 'Fácil', value: filteredQuestions.filter((q) => q.difficulty === 'Fácil').length },
    { name: 'Medio', value: filteredQuestions.filter((q) => q.difficulty === 'Medio').length },
    { name: 'Difícil', value: filteredQuestions.filter((q) => q.difficulty === 'Difícil').length },
  ].filter((item) => item.value > 0);

  // Datos para gráfico circular de materias
  const subjectData = questions
    .reduce(
      (acc, q) => {
        const existing = acc.find((item) => item.name === q.subject.name);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({ name: q.subject.name, value: 1 });
        }
        return acc;
      },
      [] as { name: string; value: number }[]
    )
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // KPI
  const mostUsedQuestion = filteredQuestions[0];
  const avgUsage =
    filteredQuestions.length > 0
      ? Math.round(filteredQuestions.reduce((sum, q) => sum + q.usage_count, 0) / filteredQuestions.length)
      : 0;
  const mostCommonDifficulty =
    difficultyData.length > 0 ? difficultyData.reduce((a, b) => (a.value > b.value ? a : b)).name : 'N/A';

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

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
        <h1 className="text-3xl font-bold">Preguntas Más Usadas</h1>
        <p className="text-gray-600">Análisis de frecuencia de uso de preguntas en exámenes</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Pregunta Más Usada</p>
          <p className="text-2xl font-bold text-blue-600">{mostUsedQuestion?.question_text}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Promedio de Usos</p>
          <p className="text-2xl font-bold">{avgUsage}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total de Preguntas</p>
          <p className="text-2xl font-bold">{filteredQuestions.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Dificultad Más Común</p>
          <p className="text-2xl font-bold">{mostCommonDifficulty}</p>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Filtrar por Dificultad</label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas</option>
              <option value="Fácil">Fácil</option>
              <option value="Medio">Medio</option>
              <option value="Difícil">Difícil</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Mínimo de Usos</label>
            <input
              type="number"
              min="1"
              max="100"
              value={filterMinUsage}
              onChange={(e) => setFilterMinUsage(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Gráfico de Barras */}
      {chartData.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Top 10 Preguntas Más Usadas</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 300, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={290} />
              <Tooltip formatter={(value) => `${value} usos`} />
              <Bar dataKey="uses" fill="#3b82f6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Gráficos Circulares */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dificultad */}
        {difficultyData.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Distribución por Dificultad</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {difficultyData.map((entry, index) => {
                    const colors = {
                      'Fácil': '#10b981',
                      'Medio': '#f59e0b',
                      'Difícil': '#ef4444',
                    };
                    return <Cell key={`cell-${index}`} fill={colors[entry.name as keyof typeof colors]} />;
                  })}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Materias */}
        {subjectData.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Distribución por Materia</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subjectData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Tabla Detallada */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Detalle de Preguntas ({filteredQuestions.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="bg-gray-50">
                <th className="text-left p-3 font-semibold">Ranking</th>
                <th className="text-left p-3 font-semibold">Pregunta</th>
                <th className="text-center p-3 font-semibold">Veces Usada</th>
                <th className="text-left p-3 font-semibold">Dificultad</th>
                <th className="text-left p-3 font-semibold">Materia</th>
                <th className="text-left p-3 font-semibold">Tema</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.map((question, index) => {
                const colors = getDifficultyColor(question.difficulty);
                return (
                  <tr key={question.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-bold text-center">#{index + 1}</td>
                    <td className="p-3 max-w-md truncate">{question.question_text}</td>
                    <td className="text-center p-3">
                      <Badge className="bg-blue-100 text-blue-800">{question.usage_count}x</Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={`${colors.bg} ${colors.text}`}>{question.difficulty}</Badge>
                    </td>
                    <td className="p-3 text-sm">{question.subject.name}</td>
                    <td className="p-3 text-sm">{question.sub_topic.topic.name}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
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