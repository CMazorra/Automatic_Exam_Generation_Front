<<<<<<< HEAD
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

export async function postReevaluation(reevaluation: { exam_id: number , student_id: number, teacher_id: number, score: number}) {
  try {
=======
// src/services/reevaluationService.ts

export interface ReevaluationRequest {
  exam_id: number;
  student_id: number;
  teacher_id: number;
  score: number;
}

export async function postRecalificationRequest(data: Omit<ReevaluationRequest, 'score'>) {
  try {
    const payload = {
      ...data,
      score: 0, // Inicializamos en 0 como pide el backend para indicar "pendiente"
    };

>>>>>>> 19f7608 (feat(student-flow): Implementación completa del flujo de examen, calificación y recalificación para estudiantes.)
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reevaluation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
<<<<<<< HEAD
      body: JSON.stringify(reevaluation),
    });
    if (!response.ok) {
      throw new Error("Error al crear la reevaluación");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en postReevaluation:", error);
    throw error;
  }
}

export async function getReevaluationById(exam_id: number , student_id: number, teacher_id: number) {
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
  }
  catch (error) {
    console.error("Error en getReevaluationById:", error);
    throw error;
  }
}

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
  }
  catch (error) {
    console.error("Error en updateReevaluation:", error);
    throw error;
  }
}

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
      throw new Error("Error al eliminar la parametrización");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en deleteParams:", error);
=======
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        // AÑADIDO: Capturamos el estado HTTP y el mensaje del servidor
        const status = response.status;
        const errorDetail = await response.text().catch(() => "Mensaje no disponible");
        throw new Error(`Error al obtener las recalificaciones (Estado: ${status}, Detalle: ${errorDetail})`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en postRecalificationRequest:", error);
>>>>>>> 19f7608 (feat(student-flow): Implementación completa del flujo de examen, calificación y recalificación para estudiantes.)
    throw error;
  }
}