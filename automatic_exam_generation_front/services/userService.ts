// src/services/userService.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

type Role = "ADMIN" | "TEACHER" | "STUDENT"

interface UserPayload {
  name: string
  account: string
  password?: string
  age?: number
  course?: string
  role: Role
}

// 🔹 Función auxiliar para manejo de errores
async function handleResponse(response: Response) {
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Error ${response.status}: ${text}`)
  }
  return response.json()
}

export async function getUsers() {
  try {
    const response = await fetch(`${BASE_URL}/app/user`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })
    return await handleResponse(response)
  } catch (error) {
    console.error("Error en getUsers:", error)
    throw error
  }
}

export async function getUserById(id: string | number) {
  try {
    const response = await fetch(`${BASE_URL}/app/user/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })
    return await handleResponse(response)
  } catch (error) {
    console.error("Error en getUserById:", error)
    throw error
  }
}

export async function postUser(user: UserPayload) {
  try {
    const payload: UserPayload = {
      ...user,
      role: user.role.toUpperCase() as Role,
    }

    console.log("📦 Enviando payload al backend:", payload)

    const response = await fetch(`${BASE_URL}/app/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const data = await handleResponse(response)
    console.log("✅ Respuesta del backend:", data)
    return data
  } catch (error) {
    console.error("Error en postUser:", error)
    throw error
  }
}

export async function updateUser(id: string | number, user: Partial<UserPayload>) {
  try {
    const payload = user.role
      ? { ...user, role: user.role.toUpperCase() as Role }
      : user

    const response = await fetch(`${BASE_URL}/app/user/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    return await handleResponse(response)
  } catch (error) {
    console.error("Error en updateUser:", error)
    throw error
  }
}

export async function deleteUser(id: string | number) {
  try {
    const response = await fetch(`${BASE_URL}/app/user/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
    return await handleResponse(response)
  } catch (error) {
    console.error("Error en deleteUser:", error)
    throw error
  }
}
