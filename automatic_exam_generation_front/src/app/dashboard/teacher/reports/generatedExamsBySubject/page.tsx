'use client';

import { useEffect, useState } from 'react';
import { getGeneratedExamsBySubject } from '@/services/reportService';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getSubjects } from '@/services/subjectService';

interface Subject {
  id: number;
  name: string;
}

interface Teacher {
  id: number;
  specialty: string;
  user: {
    id_us: number;
    name: string;
  };
}

interface GeneratedExam {
  id: number;
  name: string;
  status: string;
  difficulty: string;
  subject_id: number;
  teacher: Teacher;
  parameters: {
    id: number;
  };
  createdAt?: string;
}

export default function GeneratedExamsBySubjectPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [exams, setExams] = useState<GeneratedExam[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [reportGenerated, setReportGenerated] = useState(false);

  // Cargar lista de asignaturas
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await getSubjects();
        const subjectsArray = Array.isArray(response) ? response : [response];
        setSubjects(subjectsArray);
        setError(null);
      } catch (err) {
        setError('Error al cargar las asignaturas');
        console.error(err);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedSubjectId) {
      setError('Por favor selecciona una asignatura');
      return;
    }

    setLoading(true);
    setError(null);
    setReportGenerated(false);

    try {
      const response = await getGeneratedExamsBySubject(selectedSubjectId);
      const examsArray = Array.isArray(response) ? response : [response];
      setExams(examsArray);
      setReportGenerated(true);
    } catch (err) {
      setError('Error al cargar los exámenes generados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'aprobado') return { bg: 'bg-green-100', text: 'text-green-800', hex: '#10b981' };
    if (statusLower === 'pendiente') return { bg: 'bg-yellow-100', text: 'text-yellow-800', hex: '#f59e0b' };
    if (statusLower === 'rechazado') return { bg: 'bg-red-100', text: 'text-red-800', hex: '#ef4444' };
    return { bg: 'bg-gray-100', text: 'text-gray-800', hex: '#6b7280' };
  };

  const getDifficultyColor = (difficulty: string) => {
    const diffLower = difficulty?.toLowerCase() || '';
    if (diffLower === 'fácil') return { bg: 'bg-green-100', text: 'text-green-800', hex: '#10b981' };
    if (diffLower === 'medio') return { bg: 'bg-yellow-100', text: 'text-yellow-800', hex: '#f59e0b' };
    if (diffLower === 'difícil') return { bg: 'bg-red-100', text: 'text-red-800', hex: '#ef4444' };
    return { bg: 'bg-gray-100', text: 'text-gray-800', hex: '#6b7280' };
  };

  // Filtrar por estado
  const filteredExams = filterStatus === 'all'
    ? exams
    : exams.filter(exam => exam.status.toLowerCase() === filterStatus.toLowerCase());

  // KPIs
  const totalExams = exams.length;
  const approvedExams = exams.filter(e => e.status.toLowerCase() === 'aprobado').length;
  const pendingExams = exams.filter(e => e.status.toLowerCase() === 'pendiente').length;
  const rejectedExams = exams.filter(e => e.status.toLowerCase() === 'rechazado').length;

  // Datos para gráfico de barras - Estado
  const statusData = [
    { name: 'Aprobado', value: approvedExams },
    { name: 'Pendiente', value: pendingExams },
    { name: 'Rechazado', value: rejectedExams },
  ].filter(item => item.value > 0);

  // Datos para gráfico de barras - Dificultad
  const difficultyStats = new Map<string, number>();
  exams.forEach(exam => {
    const diff = exam.difficulty || 'Desconocido';
    difficultyStats.set(diff, (difficultyStats.get(diff) || 0) + 1);
  });

  const difficultyData = Array.from(difficultyStats.entries()).map(([difficulty, count]) => ({
    name: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
    value: count,
    originalName: difficulty,
  }));

  // Datos para gráfico circular - Profesores
  const teacherStats = new Map<string, number>();
  exams.forEach(exam => {
    const teacherName = exam.teacher?.user?.name || 'Desconocido';
    teacherStats.set(teacherName, (teacherStats.get(teacherName) || 0) + 1);
  });

  const teacherData = Array.from(teacherStats.entries())
    .map(([teacher, count]) => ({
      name: teacher,
      value: count,
    }))
    .sort((a, b) => b.value - a.value);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  // Obtener nombre de la asignatura seleccionada
  const getSelectedSubjectName = () => {
    const selected = subjects.find(s => s.id === selectedSubjectId);
    return selected?.name || 'Asignatura';
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
        <h1 className="text-3xl font-bold">Exámenes Generados Automáticamente</h1>
        <p className="text-gray-600">
          Listado de exámenes generados automáticamente por asignatura
        </p>
      </div>

      {/* Selector de Asignatura */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Seleccionar Asignatura</label>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <select
                  value={selectedSubjectId || ''}
                  onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={loadingSubjects}
                >
                  <option value="">
                    {loadingSubjects ? 'Cargando asignaturas...' : 'Elige una asignatura'}
                  </option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleGenerateReport}
                disabled={!selectedSubjectId || loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap font-medium"
              >
                {loading ? 'Cargando...' : 'Generar Reporte'}
              </button>
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
      {reportGenerated && exams.length > 0 && (
        <>
          {/* Título con asignatura seleccionada */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900">
              Exámenes de: <span className="font-bold">{getSelectedSubjectName()}</span>
            </h2>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-sm text-gray-600">Total de Exámenes</p>
              <p className="text-2xl font-bold text-blue-600">{totalExams}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Aprobados</p>
              <p className="text-2xl font-bold text-green-600">{approvedExams}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingExams}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Rechazados</p>
              <p className="text-2xl font-bold text-red-600">{rejectedExams}</p>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gráfico de Barras - Estado */}
            {statusData.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Distribución por Estado</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                      {statusData.map((entry, index) => {
                        const colors = getStatusColor(entry.name);
                        return <Cell key={`cell-${index}`} fill={colors.hex} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Gráfico de Barras - Dificultad */}
            {difficultyData.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Distribución por Dificultad</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={difficultyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                      {difficultyData.map((entry, index) => {
                        const colors = getDifficultyColor(entry.originalName);
                        return <Cell key={`cell-${index}`} fill={colors.hex} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Gráfico Circular - Profesores */}
            {teacherData.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Exámenes por Profesor</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={teacherData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {teacherData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>

          {/* Filtro */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Filtrar por Estado:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos</option>
                <option value="aprobado">Aprobado</option>
                <option value="pendiente">Pendiente</option>
                <option value="rechazado">Rechazado</option>
              </select>
              {filterStatus !== 'all' && (
                <button
                  onClick={() => setFilterStatus('all')}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Limpiar
                </button>
              )}
            </div>
          </Card>

          {/* Tabla Detallada */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Detalle de Exámenes ({filteredExams.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-semibold">Examen</th>
                    <th className="text-left p-3 font-semibold">Profesor</th>
                    <th className="text-left p-3 font-semibold">Especialidad</th>
                    <th className="text-left p-3 font-semibold">Dificultad</th>
                    <th className="text-center p-3 font-semibold">Estado</th>
                    <th className="text-center p-3 font-semibold">Parámetros</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExams.map((exam) => {
                    const statusColors = getStatusColor(exam.status);
                    const difficultyColors = getDifficultyColor(exam.difficulty);
                    return (
                      <tr key={exam.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{exam.name}</td>
                        <td className="p-3">{exam.teacher?.user?.name || 'N/A'}</td>
                        <td className="p-3">{exam.teacher?.specialty || 'N/A'}</td>
                        <td className="p-3">
                          <Badge className={`${difficultyColors.bg} ${difficultyColors.text}`}>
                            {exam.difficulty}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Badge className={`${statusColors.bg} ${statusColors.text}`}>
                            {exam.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Badge className="bg-blue-100 text-blue-800">
                            ID: {exam.parameters.id}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {reportGenerated && exams.length === 0 && !loading && (
        <Card className="p-6 text-center">
          <p className="text-gray-600">No hay exámenes generados para esta asignatura</p>
        </Card>
      )}
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