'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  TrendingUp,
  CheckCircle,
  Users,
  AlertCircle,
  GitCompare,
  Clock,
} from 'lucide-react';

interface Report {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const reports: Report[] = [
  {
    id: 1,
    title: 'Exámenes Generados Automáticamente',
    description: 'Listado de exámenes generados automáticamente para una asignatura específica, con nombre del creador, fecha de creación y parámetros utilizados.',
    icon: <BarChart3 className="w-8 h-8" />,
    path: '/dashboard/head_teacher/reports/generatedExamsBySubject',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    id: 2,
    title: 'Preguntas Más Utilizadas',
    description: 'Preguntas más utilizadas en los exámenes finales de una asignatura, clasificadas por nivel de dificultad y tema.',
    icon: <TrendingUp className="w-8 h-8" />,
    path: '/dashboard/head_teacher/reports/mostUsedQuestions',
    color: 'bg-green-50 border-green-200',
  },
  {
    id: 3,
    title: 'Exámenes Validados',
    description: 'Exámenes que fueron validados por un revisor determinado, indicando la fecha de validación y observaciones del proceso.',
    icon: <CheckCircle className="w-8 h-8" />,
    path: '/dashboard/head_teacher/reports/approvedByHeadTeacher',
    color: 'bg-emerald-50 border-emerald-200',
  },
  {
    id: 4,
    title: 'Desempeño del Examen',
    description: 'Reporte sobre el desempeño de los estudiantes en un examen, clasificando preguntas por dificultad y comparando tasas de acierto.',
    icon: <Users className="w-8 h-8" />,
    path: '/dashboard/head_teacher/reports/examPerformance',
    color: 'bg-purple-50 border-purple-200',
  },
  {
    id: 5,
    title: 'Análisis de Dificultad y Rendimiento',
    description: 'Correlación entre el nivel de dificultad de preguntas y rendimiento de estudiantes. Identifica las 10 preguntas con mayor tasa de reprobación, autor y asignatura.',
    icon: <AlertCircle className="w-8 h-8" />,
    path: '/dashboard/head_teacher/reports/questionStudentCorrelation',
    color: 'bg-red-50 border-red-200',
  },
  {
    id: 6,
    title: 'Comparativa de Exámenes',
    description: 'Comparar exámenes generados para diferentes asignaturas, verificando distribución de preguntas por tema, dificultad y criterios de equilibrio.',
    icon: <GitCompare className="w-8 h-8" />,
    path: '/dashboard/head_teacher/reports/compareExams',
    color: 'bg-orange-50 border-orange-200',
  },
  {
    id: 7,
    title: 'Registro de Revisores',
    description: 'Profesores que han revisado exámenes en los últimos dos semestres, especificando asignatura y número de exámenes revisados.',
    icon: <Clock className="w-8 h-8" />,
    path: '/dashboard/head_teacher/reports/teachersReview',
    color: 'bg-indigo-50 border-indigo-200',
  },
];

export default function ReportsPage() {
  const router = useRouter();

  const handleReportClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-gray-900">Centro de Reportes</h1>
          <p className="text-lg text-gray-600">
            Accede a los reportes disponibles para analizar datos de exámenes, preguntas y desempeño estudiantil
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reportes Disponibles</p>
                <p className="text-3xl font-bold text-blue-600">{reports.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categorías</p>
                <p className="text-3xl font-bold text-green-600">3</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Análisis</p>
                <p className="text-3xl font-bold text-purple-600">7</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Reports Grid */}
        <div className="space-y-6">
          {/* Sección 1: Reportes de Exámenes */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-1 w-8 bg-blue-600 rounded"></div>
              <h2 className="text-2xl font-bold text-gray-900">Reportes de Exámenes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reports.slice(0, 3).map((report) => (
                <Card
                  key={report.id}
                  className={`border-2 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${report.color}`}
                >
                  <div className="p-6 h-full flex flex-col justify-between">
                    <div>
                      <div className="mb-4 text-blue-600">{report.icon}</div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">{report.title}</h3>
                      <p className="text-sm text-gray-700 mb-4">{report.description}</p>
                    </div>
                    <Button
                      onClick={() => handleReportClick(report.path)}
                      className="w-full"
                    >
                      Ver Reporte
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Sección 2: Reportes de Rendimiento */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-1 w-8 bg-purple-600 rounded"></div>
              <h2 className="text-2xl font-bold text-gray-900">Reportes de Rendimiento</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.slice(3, 5).map((report) => (
                <Card
                  key={report.id}
                  className={`border-2 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${report.color}`}
                >
                  <div className="p-6 h-full flex flex-col justify-between">
                    <div>
                      <div className="mb-4">{report.icon}</div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">{report.title}</h3>
                      <p className="text-sm text-gray-700 mb-4">{report.description}</p>
                    </div>
                    <Button
                      onClick={() => handleReportClick(report.path)}
                      className="w-full"
                    >
                      Ver Reporte
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Sección 3: Reportes Comparativos */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-1 w-8 bg-orange-600 rounded"></div>
              <h2 className="text-2xl font-bold text-gray-900">Reportes Comparativos</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.slice(5).map((report) => (
                <Card
                  key={report.id}
                  className={`border-2 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${report.color}`}
                >
                  <div className="p-6 h-full flex flex-col justify-between">
                    <div>
                      <div className="mb-4">{report.icon}</div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">{report.title}</h3>
                      <p className="text-sm text-gray-700 mb-4">{report.description}</p>
                    </div>
                    <Button
                      onClick={() => handleReportClick(report.path)}
                      className="w-full"
                    >
                      Ver Reporte
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}