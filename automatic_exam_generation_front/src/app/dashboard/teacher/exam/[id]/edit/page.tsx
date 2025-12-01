"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getExamById, updateExam } from "@/services/examService";
import { getSubjects } from "@/services/subjectService"
import { getTeachers } from "@/services/teacherService"
import { getParams } from "@/services/paramsService"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EditExamPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([])
  const [subjectQuery, setSubjectQuery] = useState("")
  const [teachers, setTeachers] = useState<any[]>([])
  const [teacherQuery, setTeacherQuery] = useState("")
  const [paramsList, setParamsList] = useState<any[]>([])
  const [paramsQuery, setParamsQuery] = useState("")
  const [headTeachers, setHeadTeachers] = useState<any[]>([])
  const [headQuery, setHeadQuery] = useState("")

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

  // load lists
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [s, t, p] = await Promise.all([getSubjects(), getTeachers(), getParams()])
        if (!mounted) return
        setSubjects(Array.isArray(s) ? s : [])
        setTeachers(Array.isArray(t) ? t : [])
        setParamsList(Array.isArray(p) ? p : [])
        const heads = (Array.isArray(t) ? t.filter((x: any) => x.isHeadTeacher) : [])
        setHeadTeachers(heads.length ? heads : (Array.isArray(t) ? t : []))
      } catch (err) {
        console.error("Error loading lists:", err)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

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

          {/* subject (searchable) */}
          <div>
            <label className="block mb-1 font-medium">Asignatura</label>
            <Input value={subjectQuery} onChange={(e) => setSubjectQuery(e.target.value)} placeholder="Buscar asignatura..." />
            <div className="mt-2">
              <ul className="border rounded max-h-40 overflow-auto">
                {subjects.filter(s => (s.name||"").toLowerCase().includes(subjectQuery.trim().toLowerCase())).map(s => (
                  <li key={s.id} className={`p-2 cursor-pointer ${String(exam.subject_id)===String(s.id)?"bg-slate-100":""}`} onClick={() => { handleChange('subject_id', Number(s.id)); setSubjectQuery(s.name) }}>
                    {s.name}
                  </li>
                ))}
              </ul>
              <div className="text-xs text-muted-foreground mt-1">Seleccionada: {subjects.find(s => String(s.id)===String(exam.subject_id))?.name || "(ninguna)"}</div>
            </div>
          </div>

          {/* teacher (searchable) */}
          <div>
            <label className="block mb-1 font-medium">Profesor</label>
            <Input value={teacherQuery} onChange={(e) => setTeacherQuery(e.target.value)} placeholder="Buscar profesor..." />
            <div className="mt-2">
              <ul className="border rounded max-h-40 overflow-auto">
                {teachers.filter(t => ((t.user?.name ?? t.name ?? t.account)||"").toLowerCase().includes(teacherQuery.trim().toLowerCase())).map(t => (
                  <li key={t.id} className={`p-2 cursor-pointer ${String(exam.teacher_id)===String(t.id)?"bg-slate-100":""}`} onClick={() => { handleChange('teacher_id', Number(t.id)); setTeacherQuery((t.user?.name ?? t.name ?? t.account) || String(t.id)) }}>
                    {t.user?.name ?? t.name ?? t.account}
                  </li>
                ))}
              </ul>
              <div className="text-xs text-muted-foreground mt-1">Seleccionado: {(teachers.find(t => String(t.id)===String(exam.teacher_id))?.user?.name ?? teachers.find(t => String(t.id)===String(exam.teacher_id))?.name) || "(ninguno)"}</div>
            </div>
          </div>

          {/* parameters (searchable) */}
          <div>
            <label className="block mb-1 font-medium">Parametrización</label>
            <Input value={paramsQuery} onChange={(e) => setParamsQuery(e.target.value)} placeholder="Buscar parametrización..." />
            <div className="mt-2">
              <ul className="border rounded max-h-40 overflow-auto">
                {paramsList.filter(p => ((p.proportion||"")+" "+(p.quest_topics||"")).toLowerCase().includes(paramsQuery.trim().toLowerCase())).map(p => (
                  <li key={p.id} className={`p-2 cursor-pointer ${String(exam.parameters_id)===String(p.id)?"bg-slate-100":""}`} onClick={() => { handleChange('parameters_id', Number(p.id)); setParamsQuery(`${p.proportion} / ${p.quest_topics}`) }}>
                    {p.proportion} — {p.quest_topics}
                  </li>
                ))}
              </ul>
              <div className="text-xs text-muted-foreground mt-1">Seleccionado: {paramsList.find(p => String(p.id)===String(exam.parameters_id)) ? `${paramsList.find(p => String(p.id)===String(exam.parameters_id))?.proportion} / ${paramsList.find(p => String(p.id)===String(exam.parameters_id))?.quest_topics}` : "(ninguno)"}</div>
            </div>
          </div>

          {/* head teacher (searchable) */}
          <div>
            <label className="block mb-1 font-medium">Jefe de Asignatura</label>
            <Input value={headQuery} onChange={(e) => setHeadQuery(e.target.value)} placeholder="Buscar jefe..." />
            <div className="mt-2">
              <ul className="border rounded max-h-40 overflow-auto">
                {headTeachers.filter(h => ((h.user?.name ?? h.name ?? h.account)||"").toLowerCase().includes(headQuery.trim().toLowerCase())).map(h => (
                  <li key={h.id} className={`p-2 cursor-pointer ${String(exam.head_teacher_id)===String(h.id)?"bg-slate-100":""}`} onClick={() => { handleChange('head_teacher_id', Number(h.id)); setHeadQuery((h.user?.name ?? h.name ?? h.account) || String(h.id)) }}>
                    {h.user?.name ?? h.name ?? h.account}
                  </li>
                ))}
              </ul>
              <div className="text-xs text-muted-foreground mt-1">Seleccionado: {(headTeachers.find(h => String(h.id)===String(exam.head_teacher_id))?.user?.name ?? headTeachers.find(h => String(h.id)===String(exam.head_teacher_id))?.name) || "(ninguno)"}</div>
            </div>
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
