"use client"

import React, { useEffect, useState, use, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldSet, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getSubjectById, updateSubject, getSubjects } from "@/services/subjectService"
import { getTeachers, updateTeacher } from "@/services/teacherService"
import { postHeadTeacher, deleteHeadTeacher } from "@/services/headTeacerService"
import { toast } from "sonner"

type TeacherApi = {
  id: number | string
  isHeadTeacher?: boolean
  specialty?: string
  user?: { name?: string }
}

type TeacherOption = {
  id: number | string
  name: string
  isHead: boolean
  specialty?: string
}

interface Subject {
  id: number | string
  name?: string
  program?: string
  head_teacher_id?: number | string
}

export default function SubjectEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [subject, setSubject] = useState<Subject | null>(null)
  const [nombre, setNombre] = useState("")
  const [programa, setPrograma] = useState("")
  const [originalHeadId, setOriginalHeadId] = useState<number | string | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [teachers, setTeachers] = useState<TeacherOption[]>([])
  const [teacherQuery, setTeacherQuery] = useState("")
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherOption | null>(null)
  const [teacherOpen, setTeacherOpen] = useState(false)
  const [teacherError, setTeacherError] = useState<string | null>(null)
  const didPreselectRef = useRef(false)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSubjectById(Number(id))
        setSubject(data)
        setNombre((data?.name || "").toString())
        setPrograma((data?.program || "").toString())
        setOriginalHeadId(data?.head_teacher_id ?? null)
      } catch (e:any) {
        console.error("Error cargando asignatura:", e)
        toast.error("Error al cargar", {
          description: e?.message || "No se pudo cargar la asignatura.",
        })
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id])

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
      .catch((e) => {
        console.error("Error cargando profesores:", e)
        toast.warning("Lista incompleta", {
          description: "No se pudieron cargar todos los profesores.",
        })
      })
  }, [])

  useEffect(() => {
    if (didPreselectRef.current) return
    if (!originalHeadId || teachers.length === 0) return
    const match = teachers.find((t) => String(t.id) === String(originalHeadId))
    if (match) {
      setSelectedTeacher(match)
      setTeacherQuery(match.name)
    }
    didPreselectRef.current = true
  }, [originalHeadId, teachers])

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
      toast.warning("Faltan datos", {
        description: "Debes seleccionar un jefe de asignatura.",
      })
      return
    }

    setIsSaving(true)
    try {
      const newHeadId = selectedTeacher.id
      const headChanged = String(newHeadId) !== String(originalHeadId)

      if (headChanged) {
        try {
          await postHeadTeacher(newHeadId)
        } catch (err: any) {
          if (!/Unique constraint|P2002|409/i.test(String(err?.message))) throw err
        }
        await updateTeacher(newHeadId, { isHeadTeacher: true })

        if (originalHeadId != null) {
          const allSubjects = await getSubjects()
          const others = (allSubjects || []).filter(
            (s: any) =>
              String(s.head_teacher_id) === String(originalHeadId) &&
              String(s.id) !== String(id)
          )
          if (others.length === 0) {
            try {
              await deleteHeadTeacher(originalHeadId)
            } catch (err: any) {
              if (!/404|No encontrado/i.test(String(err?.message))) console.error(err)
            }
            try {
              await updateTeacher(originalHeadId, { isHeadTeacher: false })
            } catch (e) {
              console.error("No se pudo bajar flag isHeadTeacher antiguo:", e)
              toast.warning("Advertencia", {
                description:
                  "No se pudo actualizar el rol del jefe anterior.",
              })
            }
          }
        }
      }

      // Actualizar asignatura
      await updateSubject(Number(id), {
        name: nombre.trim(),
        program: programa.trim(),
        head_teacher_id: selectedTeacher.id,
      })

      toast.success("Asignatura actualizada", {
        description: `La asignatura "${nombre.trim()}" se guardó correctamente.`,
      })

      router.push(`/dashboard/admin/subject/${id}`)
    } catch (err: any) {
      console.error("Error guardando asignatura:", err)
      toast.error("Error al guardar", {
        description: err?.message || "Ocurrió un error inesperado.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">Cargando...</div>
      </main>
    )
  }

  if (!subject) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center text-destructive">Asignatura no encontrada</div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold">Editar Asignatura</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
              <FieldSet>
                <Field>
                  <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="programa">Programa</FieldLabel>
                  <Textarea
                    id="programa"
                    value={programa}
                    onChange={(e) => setPrograma(e.target.value)}
                    placeholder="Programa"
                    rows={6}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="jefe">Jefe de Asignatura</FieldLabel>
                  <div className="relative">
                    <Input
                      id="jefe"
                      placeholder="Escribe para buscar profesor"
                      value={teacherQuery}
                      onFocus={() => setTeacherOpen(true)}
                      onChange={(e) => {
                        const v = e.target.value
                        setTeacherQuery(v)
                        // Solo des-seleccionar si el texto ya no coincide con el seleccionado
                        if (selectedTeacher && v !== selectedTeacher.name) {
                          setSelectedTeacher(null)
                        }
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
                onClick={() => router.push(`/dashboard/admin/subject/${subject.id}`)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving || !nombre.trim()}>
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}