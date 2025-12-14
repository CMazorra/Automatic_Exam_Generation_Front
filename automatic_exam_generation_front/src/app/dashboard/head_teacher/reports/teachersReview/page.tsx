'use client';

import { useEffect, useState } from 'react';
import { getTeachersReview } from '@/services/reportService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TeacherData {
  teacher: string;
  subjects: { [subject: string]: number };
  totalReviews: number;
}

export default function TeachersReviewPage() {
  const [teachersData, setTeachersData] = useState<TeacherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getTeachersReview();
        
        // Transformar los datos del formato del backend
        const transformedData: TeacherData[] = Object.entries(response).map(([teacher, subjects]) => ({
          teacher,
          subjects: subjects as { [subject: string]: number },
          totalReviews: Object.values(subjects as { [subject: string]: number }).reduce((sum, count) => sum + count, 0),
        }));

        setTeachersData(transformedData.sort((a, b) => b.totalReviews - a.totalReviews));
        setError(null);
      } catch (err) {
        setError('Error al cargar el registro de revisiones');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getWorkloadLevel = (totalReviews: number) => {
    if (totalReviews >= 15) return { label: 'Alta', color: 'bg-red-100 text-red-800' };
    if (totalReviews >= 8) return { label: 'Media', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Baja', color: 'bg-green-100 text-green-800' };
  };

  // Filtrar por asignatura
  const filteredTeachers = filterSubject === 'all'
    ? teachersData
    : teachersData.filter(t => Object.keys(t.subjects).includes(filterSubject));

  // KPIs
  const totalTeachers = teachersData.length;
  const totalReviews = teachersData.reduce((sum, t) => sum + t.totalReviews, 0);
  const avgReviews = totalTeachers > 0 ? Math.round(totalReviews / totalTeachers) : 0;

  // Asignatura con más revisiones
  const subjectTotals = new Map<string, number>();
  teachersData.forEach(teacher => {
    Object.entries(teacher.subjects).forEach(([subject, count]) => {
      subjectTotals.set(subject, (subjectTotals.get(subject) || 0) + count);
    });
  });
  const topSubject = Array.from(subjectTotals.entries()).sort((a, b) => b[1] - a[1])[0];

  // Datos para gráfico de barras horizontal (Top profesores)
  const topTeachersData = filteredTeachers.slice(0, 10).map(t => ({
    name: t.teacher,
    reviews: t.totalReviews,
  }));

  // Datos para gráfico de barras apiladas
  const allSubjects = Array.from(new Set(teachersData.flatMap(t => Object.keys(t.subjects))));
  const stackedBarData = filteredTeachers.map(teacher => {
    const data: any = { name: teacher.teacher };
    allSubjects.forEach(subject => {
      data[subject] = teacher.subjects[subject] || 0;
    });
    return data;
  });

  // Datos para gráfico circular
  const subjectPieData = Array.from(subjectTotals.entries())
    .map(([subject, count]) => ({
      name: subject,
      value: count,
    }))
    .sort((a, b) => b.value - a.value);

  // Colores para gráficos
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  // Asignaturas únicas para filtro
  const uniqueSubjects = Array.from(subjectTotals.keys());

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
        <h1 className="text-3xl font-bold">Registro de Profesores Revisores</h1>
        <p className="text-gray-600">
          Registro detallado de profesores que han revisado exámenes en los últimos dos semestres
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total de Profesores</p>
          <p className="text-2xl font-bold text-blue-600">{totalTeachers}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Exámenes Revisados</p>
          <p className="text-2xl font-bold text-green-600">{totalReviews}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Promedio por Profesor</p>
          <p className="text-2xl font-bold text-purple-600">{avgReviews}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Asignatura Top</p>
          <p className="text-xl font-bold text-orange-600 truncate">
            {topSubject ? topSubject[0] : 'N/A'}
          </p>
        </Card>
      </div>

      {/* Filtro */}
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Filtrar por Asignatura:</label>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todas las asignaturas</option>
            {uniqueSubjects.map(subject => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Gráfico de Barras - Top Profesores */}
      {topTeachersData.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Top 10 Profesores por Número de Revisiones</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topTeachersData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="reviews" fill="#3b82f6" name="Exámenes Revisados" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-xs text-muted-foreground">
            <p className="font-semibold mb-1">Leyenda:</p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Cada barra representa el <span className="font-medium">total de exámenes revisados</span> por profesor.</li>
              <li>Ordenado por mayor carga de revisión.</li>
            </ul>
          </div>
        </Card>
      )}

      {/* Gráficos de Pastel y Barras Apiladas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico Circular - Distribución por Asignatura */}
        {subjectPieData.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Distribución de Revisiones por Asignatura</h2>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={subjectPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {subjectPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-xs text-muted-foreground">
              <p className="font-semibold mb-1">Leyenda:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>Porciones muestran la <span className="font-medium">proporción</span> del total de revisiones por asignatura.</li>
                <li>Los colores corresponden a la lista de asignaturas en el panel lateral.</li>
              </ul>
            </div>
          </Card>
        )}

        {/* Estadísticas por Asignatura */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Revisiones por Asignatura</h2>
          <div className="space-y-3 max-h-[350px] overflow-y-auto">
            {subjectPieData.map((subject, index) => (
              <div key={subject.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium">{subject.name}</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {subject.value} exámenes
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            <p className="font-semibold mb-1">Leyenda:</p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Cada fila muestra el <span className="font-medium">conteo</span> de revisiones por asignatura.</li>
              <li>El marcador de color coincide con el de la gráfica circular.</li>
            </ul>
          </div>
        </Card>
      </div>

      {/* Gráfico de Barras Apiladas */}
      {stackedBarData.length > 0 && allSubjects.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Distribución de Asignaturas por Profesor</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stackedBarData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
              <YAxis />
              <Tooltip />
              <Legend />
              {allSubjects.map((subject, index) => (
                <Bar
                  key={subject}
                  dataKey={subject}
                  stackId="a"
                  fill={COLORS[index % COLORS.length]}
                  name={subject}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-xs text-muted-foreground">
            <p className="font-semibold mb-1">Leyenda:</p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Gráfico apilado: <span className="font-medium">revisiones</span> por asignatura sobre cada profesor.</li>
              <li>Cada color corresponde a una asignatura; la leyenda muestra su nombre.</li>
            </ul>
          </div>
        </Card>
      )}

      {/* Tabla Detallada */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Detalle de Profesores ({filteredTeachers.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="bg-gray-50">
                <th className="text-left p-3 font-semibold">Profesor</th>
                <th className="text-left p-3 font-semibold">Asignaturas</th>
                <th className="text-center p-3 font-semibold">Total Revisiones</th>
                <th className="text-center p-3 font-semibold">Carga de Trabajo</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => {
                const workload = getWorkloadLevel(teacher.totalReviews);
                return (
                  <tr key={teacher.teacher} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{teacher.teacher}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(teacher.subjects).map(([subject, count]) => (
                          <Badge key={subject} className="bg-blue-100 text-blue-800">
                            {subject}: {count}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="text-center p-3">
                      <span className="font-bold text-lg text-blue-600">
                        {teacher.totalReviews}
                      </span>
                    </td>
                    <td className="text-center p-3">
                      <Badge className={workload.color}>
                        {workload.label}
                      </Badge>
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
            <li><span className="font-medium">Asignaturas</span>: detalle del número de revisiones por materia.</li>
            <li><span className="font-medium">Carga de Trabajo</span>: Alta (≥15), Media (8–14), Baja (&lt;8).</li>
          </ul>
        </div>
      </Card>

      {/* Matriz de Heatmap (Tabla Visual) */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Matriz de Revisiones (Profesor x Asignatura)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead className="border-b">
              <tr className="bg-gray-50">
                <th className="text-left p-3 font-semibold sticky left-0 bg-gray-50">Profesor</th>
                {uniqueSubjects.map(subject => (
                  <th key={subject} className="p-3 font-semibold min-w-[100px]">
                    {subject}
                  </th>
                ))}
                <th className="p-3 font-semibold bg-blue-50">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.teacher} className="border-b hover:bg-gray-50">
                  <td className="text-left p-3 font-medium sticky left-0 bg-white">
                    {teacher.teacher}
                  </td>
                  {uniqueSubjects.map(subject => {
                    const count = teacher.subjects[subject] || 0;
                    const intensity = count > 0 ? Math.min(count / 10, 1) : 0;
                    return (
                      <td
                        key={subject}
                        className="p-3"
                        style={{
                          backgroundColor: count > 0 ? `rgba(59, 130, 246, ${0.2 + intensity * 0.6})` : 'transparent',
                        }}
                      >
                        {count > 0 ? (
                          <span className="font-bold">{count}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="p-3 font-bold bg-blue-50 text-blue-700">
                    {teacher.totalReviews}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <p className="font-semibold mb-1">Leyenda:</p>
          <ul className="list-disc ml-4 space-y-1">
            <li>Intensidad de color azul indica <span className="font-medium">mayor número</span> de revisiones.</li>
            <li>La última columna <span className="font-medium">Total</span> suma todas las asignaturas por profesor.</li>
          </ul>
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