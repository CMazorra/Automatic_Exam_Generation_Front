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
export async function postRecalificationRequest(data: Omit<ReevaluationRequest, 'score'>) {
    try {
        const payload: ReevaluationRequest = {
            ...data,
            score: 0, // Inicializamos en 0 para indicar "pendiente de calificación"
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reevaluation`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(payload),
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