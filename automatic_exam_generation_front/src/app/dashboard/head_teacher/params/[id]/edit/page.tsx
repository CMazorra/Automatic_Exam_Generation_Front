"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getParamsById, updateParams } from "@/services/paramsService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const QUESTION_TYPES = ["VoF","Argumentacion","Opcion Multiple"]

interface Param {
  id: string
  proportion: string
  amount_quest: string
  quest_topics: string
}

export default function ParamEditPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const [perc, setPerc] = useState<Record<string,string>>({ VoF:"", Argumentación:"", "Opción Múltiple":"" })
  const [amount, setAmount] = useState("")
  const [topics, setTopics] = useState<string[]>([])
  const [available, setAvailable] = useState<string[]>([])
  const [newTopic, setNewTopic] = useState("")

  useEffect(() => {
    if (!id) return
    Promise.all([
      getParamsById(id),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/topics`, { cache:"no-store" }).then(r => r.ok? r.json(): [])
    ])
      .then(([param, t]) => {
        const map: Record<string,string> = { VoF:"", Argumentacion:"", "Opcion Multiple":"" };
        (param.proportion||"").split(",").filter(Boolean).forEach(seg => {
          const [pct,type] = seg.split("-")
          if (pct && type && map[type] !== undefined) map[type] = pct
        })
        setPerc(map)
        setAmount(param.amount_quest || "")
        setTopics((param.quest_topics||"").split(",").filter(Boolean))
        const list = Array.isArray(t)? t.map((x:any)=> typeof x==="string"? x : x.name).filter(Boolean): []
        setAvailable(list)
      })
      .catch(e => setError(e.message || "Error"))
      .finally(()=> setLoading(false))
  }, [id])

  const addTopic = () => {
    const t = newTopic.trim()
    if (!t || topics.includes(t)) return
    setTopics(prev => [...prev, t])
    setNewTopic("")
  }
  const addExisting = (t:string) => {
    if (topics.includes(t)) return
    setTopics(prev => [...prev, t])
  }
  const removeTopic = (t:string) => setTopics(prev => prev.filter(x => x !== t))

  const validate = () => {
    const sum = QUESTION_TYPES.map(t => Number(perc[t]||0)).reduce((a,b)=>a+b,0)
    if (sum !== 100) return "La suma de porcentajes debe ser 100"
    if (!amount || isNaN(Number(amount)) || Number(amount)<=0) return "Cantidad inválida"
    if (topics.length === 0) return "Agregue al menos un tema"
    return null
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = validate()
    if (v){ setError(v); return }
    setError(null)
    setSaving(true)
    try {
      const proportion = QUESTION_TYPES
        .filter(t => perc[t] && Number(perc[t])>0)
        .map(t => `${perc[t]}-${t}`).join(",")
      await updateParams(id!, {
        proportion,
        amount_quest: amount,
        quest_topics: topics.join(",")
      })
      router.push(`/dashboard/head_teacher/params/${id}`)
    } catch (e:any) {
      setError(e.message || "Error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div>Cargando...</div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-6 rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Editar Parametrización</h1>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Proporción (100%)</label>
            <div className="grid gap-4 sm:grid-cols-3">
              {QUESTION_TYPES.map(t => (
                <div key={t} className="space-y-1">
                  <span className="text-xs font-medium">{t}</span>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={perc[t]}
                    onChange={e => setPerc(p => ({ ...p, [t]: e.target.value }))}
                    placeholder="%"
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Cantidad de preguntas</label>
            <Input
              type="number"
              min={1}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Cantidad"
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium">Temas</label>
            <div className="flex gap-2">
              <Input
                value={newTopic}
                onChange={e => setNewTopic(e.target.value)}
                placeholder="Nuevo tema"
              />
              <Button type="button" variant="secondary" onClick={addTopic}>Añadir</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {available.map(t => (
                <Button
                  key={t}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addExisting(t)}
                >
                  + {t}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {topics.map(t => (
                <span key={t} className="text-xs px-2 py-1 rounded bg-secondary/40 flex items-center gap-1">
                  {t}
                  <button type="button" onClick={() => removeTopic(t)} className="text-destructive">✕</button>
                </span>
              ))}
              {topics.length === 0 && <span className="text-xs text-muted-foreground">Sin temas</span>}
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/head_teacher/params/${id}`)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}