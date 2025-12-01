"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getParams } from "@/services/paramsService"
import { ListViewWithAdd } from "@/components/list-view-with-add"
import { Button } from "@/components/ui/button"

interface Parameter {
  id: string
  proportion: string
  amount_quest: string
  quest_topics: string
}

const parseProportion = (p: string) =>
  p.split(",").filter(Boolean).map(x => {
    const [pct,type] = x.split("-")
    return { pct, type }
  })

export default function ParamsPage() {
  const router = useRouter()
  const [entities, setEntities] = useState<Parameter[]>([])
  useEffect(() => {
    getParams().then(d => setEntities(Array.isArray(d)? d: [])).catch(console.error)
  }, [])

  return (
    <ListViewWithAdd
      title="Parametrizaciones"
      entities={entities}
      sortFields={[
        { value: "amount_quest", label: "Cantidad" },
      ]}
      filterFields={[
        { value: "quest_topics", label: "Temas" },
        { value: "amount_quest", label: "Cantidad" },
        { value: "proportion", label: "Proporción" },
      ]}
      renderEntity={(param) => {
        const prop = parseProportion(param.proportion)
        const topics = param.quest_topics.split(",").filter(Boolean)
        return (
          <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-card-foreground text-sm">Cantidad: {param.amount_quest}</h3>
              {prop.map(p => (
                <span key={p.type} className="text-xs px-2 py-1 rounded bg-muted">{p.pct}% {p.type}</span>
              ))}
              {topics.map(t => (
                <span key={t} className="text-xs px-2 py-1 rounded bg-secondary/40">{t}</span>
              ))}
              {topics.length === 0 && <span className="text-xs text-muted-foreground">Sin temas</span>}
              <div className="ml-auto flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/teacher/params/${param.id}`)}>
                Ver detalles
                </Button>
              </div>
            </div>
          </div>
        )
      }}
      onAdd={() => router.push("/dashboard/teacher/params/new")}
    />
  )
}