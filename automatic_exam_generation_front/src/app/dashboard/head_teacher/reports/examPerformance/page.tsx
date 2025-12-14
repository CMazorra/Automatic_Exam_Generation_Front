'use client';

import { useEffect, useState } from 'react';
import { getExams } from '@/services/examService';
import { getPerformance } from '@/services/reportService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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

interface Exam {
  id: number;
  name: string;
}

interface PerformanceData {
  questionId: number;
  questionText: string;
  difficulty: string;
  correctAnswer: string;
  totalAttempts: number;
  correctCount: number;
  accuracyRate: number;
}

interface DifficultyStats {
  difficulty: string;
  avgAccuracy: number;
  count: number;
  totalAttempts: number;
  totalCorrect: number;
}

export default function ExamPerformancePage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [data, setData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingExams, setLoadingExams] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  // Cargar lista de exámenes al montar el componente
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await getExams();
        setExams(response);
        setError(null);
      } catch (err) {
        setError('Error al cargar los exámenes');
        console.error(err);
      } finally {
        setLoadingExams(false);
      }
    };

    fetchExams();
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedExamId) {
      setError('Por favor selecciona un examen');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getPerformance(selectedExamId);

      // Manejo de la estructura agrupada por dificultad
      let performanceData: PerformanceData[] = [];

      if (response && typeof response === 'object' && response.groupedByDifficulty) {
        // Respuesta agrupada por dificultad
        const grouped = response.groupedByDifficulty;
        performanceData = Object.values(grouped)
          .flat()
          .filter((item): item is PerformanceData => item !== null && item !== undefined);
      } else if (Array.isArray(response)) {
        performanceData = response;
      } else if (response && typeof response === 'object') {
        // Intenta extraer de otras propiedades comunes
        if (Array.isArray(response.data)) {
          performanceData = response.data;
        } else if (Array.isArray(response.report)) {
          performanceData = response.report;
        } else {
          performanceData = [response];
        }
      }

      if (!Array.isArray(performanceData) || performanceData.length === 0) {
        setError('No hay datos de desempeño disponibles para este examen');
        setReportGenerated(true);
        return;
      }

      setData(performanceData);
      setReportGenerated(true);
    } catch (err) {
      setError('Error al cargar los datos del desempeño');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const diffLower = difficulty?.toLowerCase() || '';
    if (diffLower === 'fácil') return { bg: 'bg-green-100', text: 'text-green-800', hex: '#10b981' };
    if (diffLower === 'medio') return { bg: 'bg-yellow-100', text: 'text-yellow-800', hex: '#f59e0b' };
    if (diffLower === 'difícil') return { bg: 'bg-red-100', text: 'text-red-800', hex: '#ef4444' };
    return { bg: 'bg-gray-100', text: 'text-gray-800', hex: '#6b7280' };
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.7) return 'bg-green-500';
    if (accuracy >= 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Filtrar datos por dificultad
  const filteredData = filterDifficulty === 'all' 
    ? data 
    : data.filter(item => item?.difficulty === filterDifficulty);

  // Datos para gráfico de barras - Desempeño General
  const chartData = filteredData
    .filter(item => item && item.questionText && typeof item.accuracyRate === 'number')
    .map((item, index) => ({
      name: `Q${index + 1}`,
      accuracy: Math.round(item.accuracyRate * 100),
      question: item.questionText.substring(0, 20) + '...',
      color: item.accuracyRate >= 0.7 ? '#10b981' : item.accuracyRate >= 0.4 ? '#f59e0b' : '#ef4444',
    }));

  // Estadísticas por dificultad
  const difficultyStats: DifficultyStats[] = [];
  const difficultyMap = new Map<string, DifficultyStats>();

  data.forEach(item => {
    const diff = item?.difficulty || 'Desconocido';
    if (!difficultyMap.has(diff)) {
      difficultyMap.set(diff, {
        difficulty: diff,
        avgAccuracy: 0,
        count: 0,
        totalAttempts: 0,
        totalCorrect: 0,
      });
    }
    const stats = difficultyMap.get(diff)!;
    stats.avgAccuracy += item?.accuracyRate || 0;
    stats.count += 1;
    stats.totalAttempts += item?.totalAttempts || 0;
    stats.totalCorrect += item?.correctCount || 0;
  });

  difficultyMap.forEach(stats => {
    stats.avgAccuracy = stats.avgAccuracy / stats.count;
    difficultyStats.push(stats);
  });

  // Datos para gráfico circular - Distribución de Dificultad
  const difficultyDistribution = difficultyStats.map(stat => ({
    name: stat.difficulty,
    value: stat.count,
  }));

  // Datos para gráfico de línea - Tendencia por Dificultad
  const difficultyTrendData = difficultyStats
    .sort((a, b) => {
      const order = { 'Fácil': 0, 'Medio': 1, 'Difícil': 2 };
      return (order[a.difficulty as keyof typeof order] ?? 3) - (order[b.difficulty as keyof typeof order] ?? 3);
    })
    .map(stat => ({
      difficulty: stat.difficulty,
      avgAccuracy: Math.round(stat.avgAccuracy * 100),
      count: stat.count,
    }));

  // KPIs
  const avgAccuracy = filteredData.length > 0
    ? Math.round((filteredData.reduce((sum, item) => sum + (item?.accuracyRate || 0), 0) / filteredData.length) * 100)
    : 0;
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
        <h1 className="text-3xl font-bold">Desempeño del Examen</h1>
        <p className="text-gray-600">Análisis detallado de respuestas y tasa de aciertos</p>
      </div>

      {/* Selector de Examen */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Seleccionar Examen</label>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <select
                  value={selectedExamId || ''}
                  onChange={(e) => setSelectedExamId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={loadingExams}
                >
                  <option value="">
                    {loadingExams ? 'Cargando exámenes...' : 'Elige un examen'}
                  </option>
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleGenerateReport}
                disabled={!selectedExamId || loading}
                className="whitespace-nowrap"
              >
                {loading ? 'Cargando...' : 'Generar Reporte'}
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>
      </Card>

      {/* Contenido del Reporte */}
      {reportGenerated && data.length > 0 && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-sm text-gray-600">Tasa Promedio de Acierto</p>
              <p className="text-2xl font-bold text-blue-600">{avgAccuracy}%</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Total de Preguntas</p>
              <p className="text-2xl font-bold">{data.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Total de Intentos</p>
              <p className="text-2xl font-bold">{data.reduce((sum, item) => sum + (item?.totalAttempts || 0), 0)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Respuestas Correctas</p>
              <p className="text-2xl font-bold text-green-600">{data.reduce((sum, item) => sum + (item?.correctCount || 0), 0)}</p>
            </Card>
          </div>

          {/* Gráfico de Barras - Desempeño General */}
          {chartData.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Desempeño General - Tasa de Aciertos por Pregunta</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Tasa de Acierto (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ccc' }}
                    formatter={(value) => `${value}%`}
                    labelFormatter={(label) => `Pregunta ${label}`}
                  />
                  <Legend />
                  <Bar
                    dataKey="accuracy"
                    fill="#3b82f6"
                    name="Tasa de Acierto (%)"
                    radius={[8, 8, 0, 0]}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Gráficos Circulares y de Línea */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Distribución de Dificultad */}
            {difficultyDistribution.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Distribución de Dificultad</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={difficultyDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {difficultyDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getDifficultyColor(entry.name).hex}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Tendencia por Dificultad */}
            {difficultyTrendData.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Tasa Promedio de Acierto por Dificultad</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={difficultyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="difficulty" />
                    <YAxis label={{ value: 'Tasa Promedio (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avgAccuracy"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Tasa Promedio (%)"
                      dot={{ fill: '#3b82f6', r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>

          {/* Filtro para Tabla */}
          <Card className="p-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Filtrar por Dificultad</label>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todas las dificultades</option>
                  {difficultyStats.map((stat) => (
                    <option key={stat.difficulty} value={stat.difficulty}>
                      {stat.difficulty} ({stat.count} preguntas)
                    </option>
                  ))}
                </select>
              </div>
              {filterDifficulty !== 'all' && (
                <Button
                  onClick={() => setFilterDifficulty('all')}
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  Limpiar Filtro
                </Button>
              )}
            </div>
          </Card>

          {/* Tabla Detallada */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">
              Detalle de Preguntas {filterDifficulty !== 'all' && `- ${filterDifficulty}`} ({filteredData.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-semibold">Pregunta</th>
                    <th className="text-left p-3 font-semibold">Dificultad</th>
                    <th className="text-center p-3 font-semibold">Intentos</th>
                    <th className="text-center p-3 font-semibold">Correctas</th>
                    <th className="text-center p-3 font-semibold">Tasa de Acierto</th>
                    <th className="text-left p-3 font-semibold">Respuesta Correcta</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item?.questionId} className="border-b hover:bg-gray-50">
                      <td className="p-3 max-w-xs truncate">{item?.questionText || 'N/A'}</td>
                      <td className="p-3">
                        <Badge className={`${getDifficultyColor(item?.difficulty).bg} ${getDifficultyColor(item?.difficulty).text}`}>
                          {item?.difficulty || 'N/A'}
                        </Badge>
                      </td>
                      <td className="text-center p-3">{item?.totalAttempts || 0}</td>
                      <td className="text-center p-3 font-semibold text-green-600">{item?.correctCount || 0}</td>
                      <td className="text-center p-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getAccuracyColor(item?.accuracyRate || 0)}`}
                              style={{ width: `${((item?.accuracyRate || 0) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold min-w-fit">
                            {Math.round((item?.accuracyRate || 0) * 100)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3 max-w-xs truncate">{item?.correctAnswer || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {reportGenerated && data.length === 0 && !loading && (
        <Card className="p-6 text-center">
          <p className="text-gray-600">No hay datos disponibles para este examen</p>
        </Card>
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