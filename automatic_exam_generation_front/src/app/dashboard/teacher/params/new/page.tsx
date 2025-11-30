"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { postParams } from "@/services/paramsService"

const QUESTION_TYPES = ["VoF","Argumentacion","Opcion Multiple"]

export default function ParamsNewPage() {
  const router = useRouter()
  const [perc, setPerc] = useState<Record<string,string>>({ VoF:"", Argumentación:"", "Opción Múltiple":"" })
  const [amount, setAmount] = useState("")
  const [topics, setTopics] = useState<string[]>([])
  const [available, setAvailable] = useState<string[]>([])
  const [newTopic, setNewTopic] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement|null>(null)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/topics`, { cache:"no-store" })
      .then(r => r.ok? r.json(): [])
      .then(d => {
        const list = Array.isArray(d)? d.map((t:any)=> typeof t==="string"? t: t.name).filter(Boolean): []
        setAvailable(list)
      }).catch(()=>{})
  }, [])

  const filteredSuggestions = newTopic.trim()
    ? available
        .filter(t => t.toLowerCase().includes(newTopic.toLowerCase()))
        .filter(t => !topics.includes(t))
        .slice(0,8)
    : []

  const addTopic = (value?: string) => {
    const raw = (value ?? newTopic).trim()
    if (!raw || topics.includes(raw)) return
    setTopics(prev => [...prev, raw])
    setNewTopic("")
    setShowSuggestions(false)
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
      await postParams({
        proportion,
        amount_quest: amount,
        quest_topics: topics.join(",")
      })
      router.push("/dashboard/teacher/params")
    } catch (e:any) {
      setError(e.message || "Error")
    } finally {
      setSaving(false)
    }
  }

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!suggestionsRef.current) return
      if (!suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-6 rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Nueva Parametrización</h1>
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
          <div className="space-y-3" ref={suggestionsRef}>
            <label className="text-sm font-medium">Temas</label>
            <div className="flex gap-2 relative">
              <Input
                value={newTopic}
                onChange={e => {
                  setNewTopic(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTopic()
                  }
                }}
                placeholder="Escriba un tema"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => addTopic()}
                disabled={!newTopic.trim()}
              >
                Añadir
              </Button>
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 z-10 mt-1 w-full rounded-md border bg-popover shadow">
                  <ul className="max-h-48 overflow-auto text-xs">
                    {filteredSuggestions.map(s => (
                      <li
                        key={s}
                        className="px-2 py-1 cursor-pointer hover:bg-accent/50"
                        onMouseDown={() => addTopic(s)}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {topics.map(t => (
                <span key={t} className="text-xs px-2 py-1 rounded bg-secondary/40 flex items-center gap-1">
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTopic(t)}
                    className="text-destructive"
                    aria-label="remove topic"
                  >
                    ✕
                  </button>
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
              onClick={() => router.push("/dashboard/teacher/params")}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Crear"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}