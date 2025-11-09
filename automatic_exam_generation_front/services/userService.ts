// src/services/userService.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export async function getUsers() {
  try {
    const response = await fetch(`${BASE_URL}/app/user`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Error al obtener los usuarios: ${response.status}`)
    }

    const data = await response.json()
    return data
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

    if (!response.ok) {
      throw new Error(`Error al obtener el usuario con ID ${id}: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error en getUserById:", error)
    throw error
  }
}

export async function postUser(user: {
  name: string
  account: string
  password?: string
  age?: number
  course?: string
  role: "ADMIN" | "TEACHER" | "STUDENT"
}) {
  try {
    const payload = {
      ...user,
      role: user.role.toUpperCase() as "ADMIN" | "TEACHER" | "STUDENT",
    }

    const response = await fetch(`${BASE_URL}/app/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Error al crear el usuario: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error en postUser:", error)
    throw error
  }
}

export async function updateUser(
  id: string | number,
  user: Partial<{
    name: string
    account: string
    password: string
    age: number
    course: string
    role: "ADMIN" | "TEACHER" | "STUDENT"
  }>
) {
  try {
    const payload = user.role
      ? { ...user, role: user.role.toUpperCase() as "ADMIN" | "TEACHER" | "STUDENT" }
      : user

    const response = await fetch(`${BASE_URL}/app/user/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Error al actualizar el usuario con ID ${id}: ${response.status}`)
    }

    const data = await response.json()
    return data
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

    if (!response.ok) {
      throw new Error(`Error al eliminar el usuario con ID ${id}: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error en deleteUser:", error)
    throw error
  }
}
