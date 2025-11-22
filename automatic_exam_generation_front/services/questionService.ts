// src/services/questionService.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Helper
async function handleResponse(response: Response) {
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Error ${response.status}: ${text}`)
  }
  return response.json()
}

// ---- CRUD ----

export async function getQuestions() {
  try {
    const response = await fetch(`${BASE_URL}/app/questions`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })
    return await handleResponse(response)
  } catch (error) {
    console.error("Error en getQuestions:", error)
    throw error
  }
}

export async function getQuestionById(id: string | number) {
  try {
    const response = await fetch(`${BASE_URL}/app/questions/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })
    return await handleResponse(response)
  } catch (error) {
    console.error("Error en getQuestionById:", error)
    throw error
  }
}

export async function postQuestion(question: any) {
  try {
    const response = await fetch(`${BASE_URL}/app/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(question),
    })
    return await handleResponse(response)
  } catch (error) {
    console.error("Error en postQuestion:", error)
    throw error
  }
}

export async function updateQuestion(id: string | number, question: any) {
  try {
    const response = await fetch(`${BASE_URL}/app/questions/${id}`, {
      method: "PUT", // Pristania usa PUT, igual que tu controlador
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(question),
    })
    return await handleResponse(response)
  } catch (error) {
    console.error("Error en updateQuestion:", error)
    throw error
  }
}

export async function deleteQuestion(id: string | number) {
  try {
    const response = await fetch(`${BASE_URL}/app/questions/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
    return await handleResponse(response)
  } catch (error) {
    console.error("Error en deleteQuestion:", error)
    throw error
  }
}
