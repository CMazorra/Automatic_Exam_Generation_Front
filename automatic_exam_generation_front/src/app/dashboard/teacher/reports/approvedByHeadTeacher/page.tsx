'use client';

import { useEffect, useState, useRef } from 'react';
import { getHeadTeachers } from '@/services/headTeacerService';
import { listApprovedByHeadTeacher } from '@/services/reportService';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

interface HeadTeacher {
  id: number;
  teacher: {
    id: number;
    isHeadTeacher: boolean;
    specialty: string;
    user: {
      id_us: number;
      name: string;
      account: string;
      age: number;
      course: string;
      role: string;
      isActive: boolean;
    };
  };
}

interface ApprovedExam {
  exam: {
    id: number;
    name: string;
    subject: { name: string };
  };
  date: string;
  guidelines: string;
}

export default function ApprovedByHeadTeacherPage() {
  const [headTeachers, setHeadTeachers] = useState<HeadTeacher[]>([]);
  const [selectedHeadTeacherId, setSelectedHeadTeacherId] = useState<number | null>(null);
  const [exams, setExams] = useState<ApprovedExam[]>([]);
  const [loadingHeadTeachers, setLoadingHeadTeachers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [reportGenerated, setReportGenerated] = useState(false);
  const reportRef = useRef<HTMLDivElement | null>(null);

  // Cargar lista de head teachers
  useEffect(() => {
    const fetchHeadTeachers = async () => {
      try {
        const response = await getHeadTeachers();
        const teachersArray = Array.isArray(response) ? response : [response];
        setHeadTeachers(teachersArray);
        setError(null);
      } catch (err) {
        setError('Error al cargar los jefes de departamento');
        console.error(err);
      } finally {
        setLoadingHeadTeachers(false);
      }
    };

    fetchHeadTeachers();
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedHeadTeacherId) {
      setError('Por favor selecciona un jefe de departamento');
      return;
    }

    setLoading(true);
    setError(null);
    setReportGenerated(false);

    try {
      const response = await listApprovedByHeadTeacher(selectedHeadTeacherId);
      const examsArray = Array.isArray(response) ? response : [response];
      setExams(examsArray);
      setReportGenerated(true);
    } catch (err) {
      setError('Error al cargar los exámenes aprobados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Determinar estado del examen
  const getExamStatus = (guidelines: string) => {
    const lowerGuidelines = guidelines?.toLowerCase() || '';
    if (lowerGuidelines.includes('rechazado')) return 'Rechazado';
    return 'Aprobado';
  };

  const getStatusColor = (status: string) => {
    if (status === 'Aprobado') return { bg: 'bg-green-100', text: 'text-green-800', hex: '#10b981' };
    return { bg: 'bg-red-100', text: 'text-red-800', hex: '#ef4444' };
  };

  // Filtrar datos
  const filteredExams = exams.filter(exam => {
    const status = getExamStatus(exam.guidelines);
    const examDate = new Date(exam.date);
    const isSubjectMatch = filterSubject === 'all' || exam.exam.subject.name === filterSubject;
    const isStatusMatch = filterStatus === 'all' || status === filterStatus;
    const isDateMatch = (!filterDateFrom || examDate >= new Date(filterDateFrom)) &&
                        (!filterDateTo || examDate <= new Date(filterDateTo));
    return isSubjectMatch && isStatusMatch && isDateMatch;
  });

  // Estadísticas
  const approved = exams.filter(e => getExamStatus(e.guidelines) === 'Aprobado').length;
  const rejected = exams.filter(e => getExamStatus(e.guidelines) === 'Rechazado').length;
  const approvalRate = exams.length > 0 ? Math.round((approved / exams.length) * 100) : 0;

  // Datos por materia
  const subjectStats = new Map<string, number>();
  exams.forEach(exam => {
    const subject = exam.exam.subject.name;
    subjectStats.set(subject, (subjectStats.get(subject) || 0) + 1);
  });

  const subjectData = Array.from(subjectStats.entries()).map(([subject, count]) => ({
    name: subject,
    count,
  }));

  // Datos por estado
  const statusData = [
    { name: 'Aprobado', value: approved },
    { name: 'Rechazado', value: rejected },
  ].filter(item => item.value > 0);

  // Timeline (agrupar por fechas)
  const timelineMap = new Map<string, number>();
  exams.forEach(exam => {
    const dateStr = new Date(exam.date).toLocaleDateString('es-ES');
    timelineMap.set(dateStr, (timelineMap.get(dateStr) || 0) + 1);
  });

  const timelineData = Array.from(timelineMap.entries())
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-10) // Últimos 10 días
    .map(([date, count]) => ({
      date,
      count,
    }));

  // Materias únicas para filtro
  const uniqueSubjects = Array.from(new Set(exams.map(e => e.exam.subject.name)));

  // Obtener nombre del jefe de departamento seleccionado
  const getSelectedHeadTeacherName = () => {
    const selected = headTeachers.find(t => t.id === selectedHeadTeacherId);
    return selected?.teacher?.user?.name || 'Jefe de Departamento';
  };

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Exámenes Aprobados</h1>
        <p className="text-gray-600">Gestión de exámenes aprobados por jefes de departamento</p>
      </div>

      {/* Selector de Head Teacher */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Seleccionar Jefe de Departamento</label>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <select
                  value={selectedHeadTeacherId || ''}
                  onChange={(e) => setSelectedHeadTeacherId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={loadingHeadTeachers}
                >
                  <option value="">
                    {loadingHeadTeachers ? 'Cargando jefes de departamento...' : 'Elige un jefe de departamento'}
                  </option>
                  {headTeachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.teacher?.user?.name} ({teacher.teacher?.specialty})
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleGenerateReport}
                disabled={!selectedHeadTeacherId || loading}
                className="whitespace-nowrap"
              >
                {loading ? 'Cargando...' : 'Generar Reporte'}
              </Button>
              {/* Removed PDF export; using window.print instead */}
              {reportGenerated && exams.length > 0 && (
                <Button
                  onClick={() => {
                    // Ensure printable colors avoid oklch
                    document.documentElement.classList.add('pdf-override');
                    window.print();
                    // Remove after print returns
                    setTimeout(() => {
                      document.documentElement.classList.remove('pdf-override');
                    }, 0);
                  }}
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  Imprimir
                </Button>
              )}
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
        <div
          ref={reportRef}
          id="report-content"
          className="bg-white p-6 rounded-lg space-y-6"
        >
          {/* Print styles scoped */}
          <style>{`
            @media print {
              /* Hide everything except the report content */
              body * { visibility: hidden; }
              #report-content, #report-content * { visibility: visible; }
              #report-content { position: absolute; left: 0; top: 0; width: 100%; }
              /* Page setup */
              @page { size: A4 portrait; margin: 10mm; }
            }
          `}</style>
          {/* Título con nombre del jefe seleccionado */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900">
              Reporte de: <span className="font-bold">{getSelectedHeadTeacherName()}</span>
            </h2>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-sm text-gray-600">Total de Exámenes</p>
              <p className="text-2xl font-bold text-blue-600">{exams.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Aprobados</p>
              <p className="text-2xl font-bold text-green-600">{approved}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Rechazados</p>
              <p className="text-2xl font-bold text-red-600">{rejected}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Tasa de Aprobación</p>
              <p className="text-2xl font-bold text-purple-600">{approvalRate}%</p>
            </Card>
          </div>

          {/* Gráfico de Barras - Exámenes por Materia */}
          {subjectData.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Exámenes Aprobados por Materia</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" name="Cantidad" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Gráficos Circulares y Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gráfico Circular - Estado */}
            {statusData.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Estado de Exámenes</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getStatusColor(entry.name).hex}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Timeline */}
            {timelineData.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Aprobaciones por Fecha</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Cantidad"
                      dot={{ fill: '#3b82f6', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>

          {/* Filtros */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Materia</label>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todas</option>
                  {uniqueSubjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todos</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="Rechazado">Rechazado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Desde</label>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Hasta</label>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            {(filterSubject !== 'all' || filterStatus !== 'all' || filterDateFrom || filterDateTo) && (
              <Button
                onClick={() => {
                  setFilterSubject('all');
                  setFilterStatus('all');
                  setFilterDateFrom('');
                  setFilterDateTo('');
                }}
                variant="outline"
                className="mt-4"
              >
                Limpiar Filtros
              </Button>
            )}
          </Card>

          {/* Tabla Detallada */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Detalle de Exámenes ({filteredExams.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-semibold">Examen</th>
                    <th className="text-left p-3 font-semibold">Materia</th>
                    <th className="text-center p-3 font-semibold">Fecha</th>
                    <th className="text-left p-3 font-semibold">Estado</th>
                    <th className="text-left p-3 font-semibold">Notas/Directrices</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExams.length > 0 ? (
                    filteredExams.map((exam) => {
                      const status = getExamStatus(exam.guidelines);
                      const colors = getStatusColor(status);
                      return (
                        <tr key={exam.exam.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{exam.exam.name}</td>
                          <td className="p-3">{exam.exam.subject.name}</td>
                          <td className="text-center p-3">
                            {new Date(exam.date).toLocaleDateString('es-ES')}
                          </td>
                          <td className="p-3">
                            <Badge className={`${colors.bg} ${colors.text}`}>
                              {status}
                            </Badge>
                          </td>
                          <td className="p-3 max-w-md truncate">{exam.guidelines}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-3 text-center text-gray-500">
                        No hay exámenes que coincidan con los filtros
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {reportGenerated && exams.length === 0 && !loading && (
        <Card className="p-6 text-center">
          <p className="text-gray-600">No hay exámenes aprobados para este jefe de departamento</p>
        </Card>
      )}
    </div>
  );
}