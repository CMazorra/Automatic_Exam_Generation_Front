// examService.ts
// Este archivo contiene funciones para gestionar exámenes desde el frontend.
// Cada función realiza una llamada a la API usando fetch y process.env.NEXT_PUBLIC_API_URL.
// Se explica cada concepto con comentarios educativos.

/**
 * ¿Qué es una API?
 * Una API permite que el frontend y el backend se comuniquen usando HTTP.
 */

/**
 * ¿Qué es un endpoint?
 * Un endpoint es una URL específica en la API para una acción (ej: /exams).
 */

/**
 * ¿Qué es un método HTTP?
 * - GET: obtener datos
 * - POST: crear datos
 * - PUT: actualizar datos
 * - DELETE: eliminar datos
 */

export async function getExams() {
  // Obtiene la lista de exámenes desde la API (GET)
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exams`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store",
    })
    if (!response.ok) throw new Error("Error al obtener exámenes")
    return await response.json()
  } catch (error) {
    console.error("Error en getExams:", error)
    throw error
  }
}

export async function createExam(data: Record<string, any>) {
  // Crea un nuevo examen en la API (POST)
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al crear examen")
    return await response.json()
  } catch (error) {
    console.error("Error en createExam:", error)
    throw error
  }
}

export async function updateExam(id: string | number, data: Record<string, any>) {
  // Actualiza un examen existente en la API (PUT)
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exams/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al actualizar examen")
    return await response.json()
  } catch (error) {
    console.error("Error en updateExam:", error)
    throw error
  }
}

export async function deleteExam(id: string | number) {
  // Elimina un examen de la API (DELETE)
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exams/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
    if (!response.ok) throw new Error("Error al eliminar examen")
    return await response.json()
  } catch (error) {
    console.error("Error en deleteExam:", error)
    throw error
  }
}

export async function assignExamToStudent(examId: string | number, studentId: string | number) {
  // Asigna un examen a un estudiante (POST)
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exams/${examId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ studentId }),
    })
    if (!response.ok) throw new Error("Error al asignar examen")
    return await response.json()
  } catch (error) {
    console.error("Error en assignExamToStudent:", error)
    throw error
  }
}

export async function generateExamAutomatically(data: Record<string, any>) {
  // Genera un examen automáticamente (POST)
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exams/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al generar examen automáticamente")
    return await response.json()
  } catch (error) {
    console.error("Error en generateExamAutomatically:", error)
    throw error
  }
}
