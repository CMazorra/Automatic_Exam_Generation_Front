"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getParamsById, deleteParams } from "@/services/paramsService";
import { Button } from "@/components/ui/button";

interface Param {
  id: string;
  proportion: string;
  amount_quest: string;
  quest_topics: string;
}

const parseProportion = (p: string) =>
  p.split(",").filter(Boolean);

export default function ParamViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<Param | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getParamsById(id).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div>Cargando...</div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-destructive">No encontrado</div>
      </main>
    );
  }

  const proportions = parseProportion(data.proportion);
  const topics = data.quest_topics.split(",").filter(Boolean);

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="font-semibold text-xl">Parametrización</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium mb-1">Proporción</h3>
              <ul className="list-disc ml-5 text-xs">
                {proportions.map(p => <li key={p}>{p}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-1">Cantidad de preguntas</h3>
              <p className="text-xs">{data.amount_quest}</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Temas</h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {topics.map(t => (
                  <span key={t} className="px-2 py-1 rounded bg-muted">{t}</span>
                ))}
                {topics.length === 0 && <span className="text-muted-foreground">Sin temas</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button variant="outline" onClick={() => router.push("/dashboard/teacher/params")}>Volver</Button>
            <Button onClick={() => router.push(`/dashboard/teacher/params/${data.id}/edit`)}>Editar</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!confirm("Eliminar?")) return
                try {
                  await deleteParams(data.id)
                  router.push("/dashboard/teacher/params")
                } catch (e:any) {
                  alert(e.message || "Error")
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}