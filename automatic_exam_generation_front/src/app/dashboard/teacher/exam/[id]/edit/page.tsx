"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getExamById, updateExam } from "@/services/examService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EditExamPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar datos del examen
  useEffect(() => {
    async function load() {
      try {
        const data = await getExamById(id);
        setExam(data);
      } catch (error) {
        console.error(error);
        alert("Error al cargar examen.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleChange = (key: string, value: any) => {
    setExam((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateExam(id, exam);
      alert("Examen actualizado correctamente.");
      router.push(`/dashboard/teacher/exam/${id}`);
    } catch (error) {
      console.error(error);
      alert("Error al actualizar examen.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-8">Cargando...</p>;
  if (!exam) return <p className="p-8">Examen no encontrado.</p>;

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-xl mx-auto p-6 border bg-card rounded-xl shadow-sm">
        <h2 className="text-2xl font-semibold mb-6">Editar Examen</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* name */}
          <div>
            <label className="block mb-1 font-medium">Nombre</label>
            <Input
              value={exam.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          {/* difficulty */}
          <div>
            <label className="block mb-1 font-medium">Dificultad</label>
            <Input
              value={exam.difficulty}
              onChange={(e) => handleChange("difficulty", e.target.value)}
              required
            />
          </div>

          {/* status */}
          <div>
            <label className="block mb-1 font-medium">Estado</label>
            <Input
              value={exam.status}
              onChange={(e) => handleChange("status", e.target.value)}
              required
            />
          </div>

          {/* subject_id */}
          <div>
            <label className="block mb-1 font-medium">subject_id</label>
            <Input
              type="number"
              value={exam.subject_id}
              onChange={(e) => handleChange("subject_id", Number(e.target.value))}
              required
            />
          </div>

          {/* teacher_id */}
          <div>
            <label className="block mb-1 font-medium">teacher_id</label>
            <Input
              type="number"
              value={exam.teacher_id}
              onChange={(e) => handleChange("teacher_id", Number(e.target.value))}
              required
            />
          </div>

          {/* parameters_id */}
          <div>
            <label className="block mb-1 font-medium">parameters_id</label>
            <Input
              type="number"
              value={exam.parameters_id}
              onChange={(e) => handleChange("parameters_id", Number(e.target.value))}
              required
            />
          </div>

          {/* head_teacher_id */}
          <div>
            <label className="block mb-1 font-medium">head_teacher_id</label>
            <Input
              type="number"
              value={exam.head_teacher_id}
              onChange={(e) => handleChange("head_teacher_id", Number(e.target.value))}
              required
            />
          </div>

          {/* buttons */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/teacher/exam/${id}`)}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
