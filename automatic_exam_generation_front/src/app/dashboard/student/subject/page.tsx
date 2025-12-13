"use client"

import { useEffect, useState } from "react"
import { ListView } from "@/components/list-view"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/services/authService"
import { getSubjects, getSubjectsByStudentID } from "@/services/subjectService"

export default function StudentSubjectsPage() {
	const router = useRouter()
	const [entities, setEntities] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set())

	useEffect(() => {
		let mounted = true
		async function load() {
			try {
				setLoading(true)
				const user = await getCurrentUser()
				const studentId = user?.id ?? user?.id_us ?? user?._id

				const all = await getSubjects()
				const subjectsArray = Array.isArray(all)
					? all
					: Array.isArray((all as any)?.data)
						? (all as any).data
						: []

				if (studentId) {
					try {
						const mySubjects = await getSubjectsByStudentID(String(studentId))
						const myArray = Array.isArray(mySubjects)
							? mySubjects
							: Array.isArray((mySubjects as any)?.data)
								? (mySubjects as any).data
								: []
						const ids = new Set(
							(myArray || []).map((s: any) => String(s.id ?? s._id ?? s.subject_id ?? s.id_subject))
						)
						if (mounted) setEnrolledIds(ids)
					} catch (e) {
						console.warn("No se pudieron cargar las asignaturas del estudiante", e)
					}
				}

				if (mounted) setEntities(subjectsArray)
			} catch (err) {
				console.error("Error cargando asignaturas:", err)
				if (mounted) setEntities([])
			} finally {
				if (mounted) setLoading(false)
			}
		}
		load()
		return () => { mounted = false }
	}, [])

	return (
		<ListView
			title="Asignaturas disponibles"
			entities={entities}
			sortFields={[
				{ value: "name", label: "Nombre" },
			]}
			filterFields={[
				{ value: "name", label: "Nombre" },
			]}
			renderEntity={(subject) => {
				const sid = String(subject.id ?? subject._id ?? subject.subject_id)
				const enrolled = enrolledIds.has(sid)
				return (
					<div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5">
						<div className="flex items-center justify-between gap-4">
							<div className="flex-1 space-y-1">
								<div className="flex items-center gap-3">
									<h3 className="font-semibold text-card-foreground">{subject.name}</h3>
									{enrolled && (
										<span className="text-sm text-muted-foreground">Cursando</span>
									)}
								</div>
							</div>
							<div className="flex gap-2">
								<Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/student/subject/${sid}`)}>
									Ver detalles
								</Button>
							</div>
						</div>
					</div>
				)
			}}
		/>
	)
}
