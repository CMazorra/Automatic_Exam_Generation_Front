"use client"

import * as React from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card"

type Tab = "question" | "exam" | "subject"

type CreateEntitiesProps = {
  initialTab?: Tab
}

// Extraer formularios individuales para poder usarlos en páginas separadas

function CreateQuestionForm({ onCreate }: { onCreate?: (payload: any) => void }) {
  const [qTexto, setQTexto] = React.useState("")
  const [qDificultad, setQDificultad] = React.useState("media")
  const [qRespuesta, setQRespuesta] = React.useState("")
  const [qTipo, setQTipo] = React.useState("objetiva")
  const [qSubtema, setQSubtema] = React.useState("")
  const [qAsignatura, setQAsignatura] = React.useState("")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { texto: qTexto, dificultad: qDificultad, respuesta: qRespuesta, tipo: qTipo, subtema: qSubtema, asignatura: qAsignatura }
    console.log("Crear pregunta:", payload)
    onCreate?.(payload)
    alert("Pregunta creada (simulado). Revisa la consola.")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva Pregunta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4">
          <div>
            <Label>Texto</Label>
            <Input value={qTexto} onChange={(e) => setQTexto(e.target.value)} placeholder="Enunciado de la pregunta" />
          </div>
          <div>
            <Label>Dificultad</Label>
            <select value={qDificultad} onChange={(e) => setQDificultad(e.target.value)} className="w-full rounded-md border px-3 py-2">
              <option value="facil">Fácil</option>
              <option value="media">Media</option>
              <option value="dificil">Difícil</option>
            </select>
          </div>
          <div>
            <Label>Respuesta</Label>
            <Input value={qRespuesta} onChange={(e) => setQRespuesta(e.target.value)} placeholder="Respuesta correcta / descripción" />
          </div>
          <div>
            <Label>Tipo</Label>
            <select value={qTipo} onChange={(e) => setQTipo(e.target.value)} className="w-full rounded-md border px-3 py-2">
              <option value="objetiva">Objetiva</option>
              <option value="subjetiva">Subjetiva</option>
            </select>
          </div>
          <div>
            <Label>Subtema</Label>
            <Input value={qSubtema} onChange={(e) => setQSubtema(e.target.value)} placeholder="Subtema o etiqueta" />
          </div>
          <div>
            <Label>Asignatura</Label>
            <Input value={qAsignatura} onChange={(e) => setQAsignatura(e.target.value)} placeholder="Nombre de la asignatura" />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={(e) => submit(e as any)}>Crear Pregunta</Button>
      </CardFooter>
    </Card>
  )
}

function CreateExamForm({ onCreate }: { onCreate?: (payload: any) => void }) {
  const [eNombre, setENombre] = React.useState("")
  const [eDificultad, setEDificultad] = React.useState("media")
  const [eEstado, setEEstado] = React.useState("borrador")
  const [eAsignatura, setEAsignatura] = React.useState("")
  const [eParam, setEParam] = React.useState("")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { nombre: eNombre, dificultad: eDificultad, estado: eEstado, asignatura: eAsignatura, parametrizacion: eParam }
    console.log("Crear examen:", payload)
    onCreate?.(payload)
    alert("Examen creado (simulado). Revisa la consola.")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuevo Examen</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4">
          <div>
            <Label>Nombre</Label>
            <Input value={eNombre} onChange={(e) => setENombre(e.target.value)} placeholder="Nombre del examen" />
          </div>
          <div>
            <Label>Dificultad</Label>
            <select value={eDificultad} onChange={(e) => setEDificultad(e.target.value)} className="w-full rounded-md border px-3 py-2">
              <option value="facil">Fácil</option>
              <option value="media">Media</option>
              <option value="dificil">Difícil</option>
            </select>
          </div>
          <div>
            <Label>Estado</Label>
            <select value={eEstado} onChange={(e) => setEEstado(e.target.value)} className="w-full rounded-md border px-3 py-2">
              <option value="borrador">Borrador</option>
              <option value="publicado">Publicado</option>
            </select>
          </div>
          <div>
            <Label>Asignatura</Label>
            <Input value={eAsignatura} onChange={(e) => setEAsignatura(e.target.value)} placeholder="Asignatura relacionada" />
          </div>
          <div>
            <Label>Parametrización</Label>
            <textarea
              value={eParam}
              onChange={(e) => setEParam(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              placeholder={"JSON u opciones (ej: {\"nPreguntas\":10})"}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={(e) => submit(e as any)}>Crear Examen</Button>
      </CardFooter>
    </Card>
  )
}

function CreateSubjectForm({ onCreate }: { onCreate?: (payload: any) => void }) {
  const [sPrograma, setSPrograma] = React.useState("")
  const [sNombre, setSNombre] = React.useState("")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { programa: sPrograma, nombre: sNombre }
    console.log("Crear asignatura:", payload)
    onCreate?.(payload)
    alert("Asignatura creada (simulado). Revisa la consola.")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva Asignatura</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4">
          <div>
            <Label>Programa</Label>
            <textarea value={sPrograma} onChange={(e) => setSPrograma(e.target.value)} className="w-full rounded-md border px-3 py-2" placeholder="Descripción del programa" />
          </div>
          <div>
            <Label>Nombre</Label>
            <Input value={sNombre} onChange={(e) => setSNombre(e.target.value)} placeholder="Nombre de la asignatura" />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={(e) => submit(e as any)}>Crear Asignatura</Button>
      </CardFooter>
    </Card>
  )
}

export { CreateQuestionForm, CreateExamForm, CreateSubjectForm }

export default function CreateEntities({ initialTab }: CreateEntitiesProps) {
  const [tab, setTab] = React.useState<Tab>(initialTab ?? "question")

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex gap-2 mb-6">
        <Button variant={tab === "question" ? "default" : "ghost"} onClick={() => setTab("question")}>
          Crear Pregunta
        </Button>
        <Button variant={tab === "exam" ? "default" : "ghost"} onClick={() => setTab("exam")}>
          Crear Examen
        </Button>
        <Button variant={tab === "subject" ? "default" : "ghost"} onClick={() => setTab("subject")}>
          Crear Asignatura
        </Button>
      </div>

      {tab === "question" && <CreateQuestionForm />}
      {tab === "exam" && <CreateExamForm />}
      {tab === "subject" && <CreateSubjectForm />}
    </div>
  )
}
