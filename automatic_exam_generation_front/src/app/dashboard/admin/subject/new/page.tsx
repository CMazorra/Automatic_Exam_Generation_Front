"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldGroup, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { postSubject } from "@/services/subjectService"
import { getTeachers } from "@/services/teacherService"
import { postHeadTeacher } from "@/services/headTeacerService"

type TeacherApi = {
  id: number | string
  isHeadTeacher?: boolean
  specialty?: string
  user?: {
    id_us: number | string
    name?: string
    account?: string
    role?: string
  }
}

type TeacherOption = {
  id: number | string
  name: string
  isHead: boolean
  specialty?: string
}

export default function SubjectCreatePage() {
  const [nombre, setNombre] = useState("")
  const [programa, setPrograma] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const [teachers, setTeachers] = useState<TeacherOption[]>([])
  const [teacherQuery, setTeacherQuery] = useState("")
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherOption | null>(null)
  const [teacherOpen, setTeacherOpen] = useState(false)
  const [teacherError, setTeacherError] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    getTeachers()
      .then((list: TeacherApi[]) =>
        setTeachers(
          list.map((t) => ({
            id: t.id,
            name: (t.user?.name || "").toString(),
            isHead: !!t.isHeadTeacher,
            specialty: t.specialty,
          }))
        )
      )
      .catch(console.error)
  }, [])

  const normalizedQuery = teacherQuery.trim().toLowerCase()
  const visibleTeachers = teachers.filter((t) =>
    t.name.toLowerCase().includes(normalizedQuery)
  )

  const selectTeacher = (t: TeacherOption) => {
    setSelectedTeacher(t)
    setTeacherQuery(t.name)
    setTeacherOpen(false)
    setTeacherError(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!nombre.trim()) return
    if (!selectedTeacher) {
      setTeacherError("Selecciona un jefe de asignatura de la lista.")
      setTeacherOpen(true)
      return
    }

    setIsSaving(true)
    try {
      await postHeadTeacher(selectedTeacher.id)

      const headId = selectedTeacher.id

      await postSubject({
        name: nombre.trim(),
        program: programa.trim(),
        head_teacher_id: headId,
      })

      router.push("/dashboard/admin/subject")
    } catch (err: any) {
      console.error("Crear asignatura falló:", err)
      alert(err?.message || "No se pudo crear la asignatura.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold">Nueva Asignatura</h1>
          <FieldGroup>
            <FieldSet>
              <Field>
                <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre de la asignatura"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="programa">Programa</FieldLabel>
                <Textarea
                  id="programa"
                  value={programa}
                  onChange={(e) => setPrograma(e.target.value)}
                  placeholder="Descripción / programa"
                  rows={6}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="jefe">Jefe de Asignatura</FieldLabel>
                <div className="relative">
                  <Input
                    id="jefe"
                    placeholder="Escribe para buscar y selecciona un profesor"
                    value={teacherQuery}
                    onFocus={() => setTeacherOpen(true)}
                    onChange={(e) => {
                      setTeacherQuery(e.target.value)
                      setSelectedTeacher(null)
                      setTeacherError(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        const exact = teachers.find(
                          (t) => t.name.toLowerCase() === normalizedQuery
                        )
                        if (exact) {
                          selectTeacher(exact)
                          return
                        }
                        if (visibleTeachers.length === 1) {
                          selectTeacher(visibleTeachers[0])
                        }
                      } else if (e.key === "Escape") {
                        setTeacherOpen(false)
                      }
                    }}
                    aria-invalid={!!teacherError}
                  />
                  {teacherOpen && (
                    <div
                      className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <ul className="max-h-60 overflow-auto py-1 text-sm">
                        {(normalizedQuery ? visibleTeachers : teachers).map((t) => (
                          <li key={t.id}>
                            <button
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground flex items-center justify-between"
                              onClick={() => selectTeacher(t)}
                            >
                              <span>{t.name || "(Sin nombre)"}</span>
                              <span className="flex gap-2">
                                {t.specialty && (
                                  <span className="text-xs text-muted-foreground">
                                    {t.specialty}
                                  </span>
                                )}
                                {t.isHead && (
                                  <span className="text-[10px] rounded bg-primary/10 text-primary px-2 py-0.5">
                                    Jefe
                                  </span>
                                )}
                              </span>
                            </button>
                          </li>
                        ))}

                        {teachers.length === 0 && (
                          <li className="px-3 py-2 text-muted-foreground">
                            No hay profesores.
                          </li>
                        )}
                        {teachers.length > 0 &&
                          (normalizedQuery ? visibleTeachers.length === 0 : false) && (
                            <li className="px-3 py-2 text-muted-foreground">
                              Sin resultados para “{teacherQuery}”.
                            </li>
                          )}
                      </ul>
                    </div>
                  )}
                </div>
                {teacherError && (
                  <p className="mt-1 text-sm text-destructive">{teacherError}</p>
                )}
              </Field>
            </FieldSet>
          </FieldGroup>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/admin/subject")}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving || !nombre.trim()}>
              {isSaving ? "Guardando..." : "Crear"}
            </Button>
          </div>
        </div>
      </form>
    </main>
  )
}
