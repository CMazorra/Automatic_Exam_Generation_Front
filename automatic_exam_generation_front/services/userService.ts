// userService.ts
// Este archivo contiene funciones para gestionar usuarios desde el frontend.
// Cada función realiza una llamada a la API usando fetch y process.env.NEXT_PUBLIC_API_URL.
// Se explica cada concepto con comentarios educativos.

/**
 * ¿Qué es una API?
 * Una API permite que el frontend y el backend se comuniquen usando HTTP.
 */

/**
 * ¿Qué es un endpoint?
 * Un endpoint es una URL específica en la API para una acción (ej: /users).
 */

/**
 * ¿Qué es un método HTTP?
 * - GET: obtener datos
 * - POST: crear datos
 * - PUT: actualizar datos
 * - DELETE: eliminar datos
 */

export async function getUsers() {
  // Obtiene la lista de usuarios desde la API (GET)
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })
    if (!response.ok) throw new Error("Error al obtener usuarios")
    return await response.json()
  } catch (error) {
    console.error("Error en getUsers:", error)
    throw error
  }
}

export async function createUser(data: Record<string, any>) {
  // Crea un nuevo usuario en la API (POST)
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al crear usuario")
    return await response.json()
  } catch (error) {
    console.error("Error en createUser:", error)
    throw error
  }
}

export async function updateUser(id: string | number, data: Record<string, any>) {
  // Actualiza un usuario existente en la API (PUT)
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al actualizar usuario")
    return await response.json()
  } catch (error) {
    console.error("Error en updateUser:", error)
    throw error
  }
}

export async function deleteUser(id: string | number) {
  // Elimina un usuario de la API (DELETE)
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
    if (!response.ok) throw new Error("Error al eliminar usuario")
    return await response.json()
  } catch (error) {
    console.error("Error en deleteUser:", error)
    throw error
  }
}
