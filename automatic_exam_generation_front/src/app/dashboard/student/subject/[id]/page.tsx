"use client"

import React, { useEffect, useState, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/services/authService"
import { getSubjectById, getSubjectsByStudentID } from "@/services/subjectService"
import { getTopicsBySubjectId } from "@/services/topicService"
import { postStudentSubject } from "@/services/studentService"
import { toast } from "sonner"

interface Subject {
	id: number | string
	name?: string
	program?: string
	head_teacher_id?: number | string
}

interface Topic {
	id: string | number
	name?: string
}

export default function StudentSubjectView({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)
	const [subject, setSubject] = useState<Subject | null>(null)
	const [topics, setTopics] = useState<Topic[]>([])
	const [isLoadingSubject, setIsLoadingSubject] = useState(true)
	const [isLoadingTopics, setIsLoadingTopics] = useState(true)
	const [isEnrolled, setIsEnrolled] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	useEffect(() => {
		const load = async () => {
			try {
				const data = await getSubjectById(Number(id))
				setSubject(data)
			} catch (e) {
				console.error("Error fetching subject:", e)
				toast.error("No se pudo cargar la asignatura.")
			} finally {
				setIsLoadingSubject(false)
			}
		}
		load()
	}, [id])

	useEffect(() => {
		const loadTopics = async () => {
			try {
				const all = await getTopicsBySubjectId(String(id))
				const arr = Array.isArray(all) ? all : []
				setTopics(arr)
			} catch (e) {
				console.error("Error fetching topics by subject:", e)
				toast.error("No se pudieron cargar los temas de la asignatura.")
			} finally {
				setIsLoadingTopics(false)
			}
		}
		loadTopics()
	}, [id])

	useEffect(() => {
		const checkEnrollment = async () => {
			try {
				const user = await getCurrentUser()
				const studentId = user?.id ?? user?.id_us ?? user?._id
				if (!studentId) return
				const mySubjects = await getSubjectsByStudentID(String(studentId))
				const myArray = Array.isArray(mySubjects)
					? mySubjects
					: Array.isArray((mySubjects as any)?.subjects)
						? (mySubjects as any).subjects
						: Array.isArray((mySubjects as any)?.data)
							? (mySubjects as any).data
							: []
				const sid = String(id)
                console.log("Student's subjects array:", myArray)
                console.log("Checking enrollment for subject ID:", sid)
				const enrolled = (myArray || []).some((s: any) => String(s.id ?? s._id ?? s.subject_id ?? s.id_subject) === sid)
				setIsEnrolled(enrolled)
			} catch (e) {
				console.warn("No se pudieron cargar las asignaturas del estudiante", e)
				toast.error("No se pudieron cargar las asignaturas del estudiante.")
			}
		}
		checkEnrollment()
	}, [id])

	const handleEnroll = async () => {
		try {
			setIsSubmitting(true)
			const user = await getCurrentUser()
			const studentId = user?.id ?? user?.id_us ?? user?._id
			if (!studentId) {
				toast.error("Usuario no identificado.")
				return
			}
			await postStudentSubject(studentId, id)
			setIsEnrolled(true)
			toast.success("Asignatura cursada", {
				description: `Ahora estás cursando la asignatura "${subject?.name || ""}".`,
			})
		} catch (e) {
			console.error("Error al cursar asignatura:", e)
			toast.error("No se pudo cursar la asignatura.")
		} finally {
			setIsSubmitting(false)
		}
	}

	if (isLoadingSubject) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-background p-4">
				<div className="text-center">Cargando asignatura...</div>
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

	const displayName = subject.name || "(Sin nombre)"

	return (
		<main className="min-h-screen bg-background p-6">
			<div className="mx-auto max-w-3xl space-y-6">
				{/* Card de detalles de la asignatura */}
				<div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
					<h2 className="font-semibold leading-none text-xl">{displayName}</h2>

					<div className="grid gap-4">
						<div>
							<div className="text-sm text-muted-foreground">Programa</div>
							<p className="mt-1 whitespace-pre-wrap">
								{subject.program || "(Sin programa)"}
							</p>
						</div>
					</div>

					<div className="flex gap-3 flex-wrap">
						<Link href="/dashboard/student/subject">
							<Button variant="outline">Volver</Button>
						</Link>
						<Button onClick={handleEnroll} disabled={isEnrolled || isSubmitting}>
							{isEnrolled ? "Ya cursando" : isSubmitting ? "Cursando..." : "Cursar asignatura"}
						</Button>
					</div>
				</div>

				{/* Card de Topics de la asignatura */}
				<div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="font-medium">Temas</h3>
					</div>

					{isLoadingTopics && (
						<div className="text-sm text-muted-foreground">Cargando temas...</div>
					)}

					{!isLoadingTopics && topics.length === 0 && (
						<div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
							No hay temas para esta asignatura.
						</div>
					)}

					{!isLoadingTopics && topics.length > 0 && (
						<div className="space-y-3">
							{topics.map((t) => (
								<div
									key={t.id}
									className="rounded-md border bg-muted/30 hover:bg-muted transition-colors p-4 flex items-center justify-between"
								>
									<div className="font-medium">{t.name || "(Sin nombre)"}</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</main>
	)
}
