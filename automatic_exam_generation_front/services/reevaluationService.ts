// src/services/reevaluationService.ts

export interface ReevaluationRequest {
    exam_id: number;
    student_id: number;
    teacher_id: number; // El profesor que calificó el examen
    score: number;
}

// ----------------------------------------------------
// READ: Obtener todas las reevaluaciones
// ----------------------------------------------------
export async function getReevaluations() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reevaluation`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            cache: "no-store",
        });

        if (!response.ok) {
            throw new Error("Error al obtener las reevaluaciones");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error en getReevaluations:", error);
        throw error;
    }
}

// ----------------------------------------------------
// CREATE: Solicitar una recalificación (Usado por el estudiante)
// ----------------------------------------------------
// Nota: La función postRecalificationRequest solo necesita los IDs, y establece score: 0 por defecto.

/**
 * Crea una solicitud de recalificación. Establece el score a 0
 * para indicar que está pendiente de revisión por el profesor.
 */
export async function postRecalificationRequest(data: Omit<ReevaluationRequest, 'score'>) {
    try {
        // 🎯 AÑADIR score: 0 al payload antes de enviar
        const payload: ReevaluationRequest = {
            ...data,
            score: 0, 
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reevaluation`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(payload), // 🎯 Usar el payload con score: 0
        });

        if (!response.ok) {
            const status = response.status;
            const errorDetail = await response.text().catch(() => "Mensaje no disponible");
            throw new Error(`Error al solicitar la recalificación (Estado: ${status}, Detalle: ${errorDetail})`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error en postRecalificationRequest:", error);
        throw error;
    }
}
// ----------------------------------------------------
// READ: Obtener una reevaluación específica por claves
// ----------------------------------------------------
export async function getReevaluationById(exam_id: number, student_id: number, teacher_id: number) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reevaluation/${exam_id}/${student_id}/${teacher_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            cache: "no-store",
        });
        if (!response.ok) {
            throw new Error("Error al obtener la reevaluación");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error en getReevaluationById:", error);
        throw error;
    }
}

// ----------------------------------------------------
// UPDATE: Actualizar la nota (Usado por el profesor)
// ----------------------------------------------------
export async function updateReevaluation(exam_id: number, student_id: number, teacher_id: number, reevaluation: { score: number }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reevaluation/${exam_id}/${student_id}/${teacher_id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(reevaluation),
        });
        if (!response.ok) {
            throw new Error("Error al actualizar la reevaluación");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error en updateReevaluation:", error);
        throw error;
    }
}

// ----------------------------------------------------
// DELETE: Eliminar una reevaluación
// ----------------------------------------------------
export async function deleteReevaluation(exam_id: number, student_id: number, teacher_id: number) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reevaluation/${exam_id}/${student_id}/${teacher_id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error("Error al eliminar la reevaluación");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error en deleteReevaluation:", error);
        throw error;
    }
}

/**
 * Verifica si ya existe una solicitud de reevaluación para un examen y estudiante.
 * Retorna true si existe, false si no.
 */
export async function checkIfRecalificationExists(exam_id: number, student_id: number): Promise<boolean> {
    try {
        // Asumo que el endpoint '/reevaluation/exam/{exam_id}/student/{student_id}' 
        // devuelve una lista de reevaluaciones o un error 404/lista vacía si no existe.
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reevaluation/exam/${exam_id}/student/${student_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            cache: "no-store",
        });

        if (!response.ok) {
            // Si el backend devuelve 404, asumimos que no hay reevaluaciones.
            if (response.status === 404) {
                return false;
            }
            throw new Error(`Error al verificar reevaluación (Estado: ${response.status})`);
        }

        const data = await response.json();
        
        // Retorna true si la lista de resultados no está vacía
        return Array.isArray(data) && data.length > 0;
        
    } catch (error) {
        console.error("Error en checkIfRecalificationExists:", error);
        // En caso de error de red o similar, mejor permitir la solicitud para no bloquear al usuario
        return false; 
    }
}