// questionService.ts
// Este archivo contiene funciones para gestionar preguntas desde el frontend.
// Cada función realiza una llamada a la API usando fetch y process.env.NEXT_PUBLIC_API_URL.
// Se maneja el flujo de errores y se explica cada concepto con comentarios educativos.

/**
 * ¿Qué es una API?
 * Una API (Interfaz de Programación de Aplicaciones) permite que dos sistemas se comuniquen.
 * En este caso, el frontend (React/Next.js) se comunica con el backend (servidor) usando HTTP.
 */

/**
 * ¿Qué es un endpoint?
 * Un endpoint es una URL específica en la API que realiza una acción, como obtener o crear preguntas.
 */

/**
 * ¿Qué es un método HTTP?
 * Los métodos HTTP definen la acción a realizar:
 * - GET: obtener datos
 * - POST: crear datos
 * - PUT: actualizar datos
 * - DELETE: eliminar datos
 */

export async function getQuestions() {
  // Obtiene la lista de preguntas desde la API (GET)
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })
    if (!response.ok) throw new Error("Error al obtener preguntas")
    return await response.json()
  } catch (error) {
    console.error("Error en getQuestions:", error)
    throw error
  }
}

export async function createQuestion(data: Record<string, any>) {
  // Crea una nueva pregunta en la API (POST)
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al crear pregunta")
    return await response.json()
  } catch (error) {
    console.error("Error en createQuestion:", error)
    throw error
  }
}

export async function updateQuestion(id: string | number, data: Record<string, any>) {
  // Actualiza una pregunta existente en la API (PUT)
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al actualizar pregunta")
    return await response.json()
  } catch (error) {
    console.error("Error en updateQuestion:", error)
    throw error
  }
}

export async function deleteQuestion(id: string | number) {
  // Elimina una pregunta de la API (DELETE)
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
    if (!response.ok) throw new Error("Error al eliminar pregunta")
    return await response.json()
  } catch (error) {
    console.error("Error en deleteQuestion:", error)
    throw error
  }
}
