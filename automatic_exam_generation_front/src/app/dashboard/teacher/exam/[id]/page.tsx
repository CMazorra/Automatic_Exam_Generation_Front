"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getExamById, deleteExam } from "@/services/examService";
import { Button } from "@/components/ui/button";

export default function ExamDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Cargar examen
  useEffect(() => {
    async function load() {
      try {
        const data = await getExamById(id);
        setExam(data);
      } catch (error) {
        console.error(error);
        alert("Error al cargar el examen.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("¿Seguro que deseas eliminar este examen?")) return;

    try {
      await deleteExam(id);
      router.push("/dashboard/teacher/exam");
    } catch {
      alert("Error al eliminar el examen.");
    }
  };

  if (loading) return <p className="p-8">Cargando...</p>;
  if (!exam) return <p className="p-8">Examen no encontrado.</p>;

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-xl mx-auto p-6 border bg-card rounded-xl shadow-sm space-y-6">
        <h2 className="text-2xl font-semibold">Detalles del Examen</h2>

        <div className="space-y-3 text-foreground">
          <p><strong>Nombre:</strong> {exam.name}</p>
          <p><strong>Estado:</strong> {exam.status}</p>
          <p><strong>Dificultad:</strong> {exam.difficulty}</p>

          <p><strong>subject_id:</strong> {exam.subject_id}</p>
          <p><strong>teacher_id:</strong> {exam.teacher_id}</p>
          <p><strong>parameters_id:</strong> {exam.parameters_id}</p>
          <p><strong>head_teacher_id:</strong> {exam.head_teacher_id}</p>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => router.push("/dashboard/teacher/exam")}>
            Volver
          </Button>

          <div className="flex gap-3">
            <Button onClick={() => router.push(`/dashboard/teacher/exam/${id}/edit`)}>
              Editar
            </Button>

            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
