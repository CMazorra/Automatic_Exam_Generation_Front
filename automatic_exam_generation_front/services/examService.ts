// src/services/examService.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getExams() {
  const res = await fetch(`${BASE_URL}/app/exam`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  return handleResponse(res);
}

export async function getExamById(id: string | number) {
  const res = await fetch(`${BASE_URL}/app/exam/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  return handleResponse(res);
}

export async function createExam(payload: Record<string, any>) {
  const res = await fetch(`${BASE_URL}/app/exam`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateExam(id: string | number, payload: Record<string, any>) {
  const res = await fetch(`${BASE_URL}/app/exam/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteExam(id: string | number) {
  const res = await fetch(`${BASE_URL}/app/exam/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse(res);
}

// ❗ Importante: el backend NO tiene este endpoint aún
export async function generateExamAutomatically(_payload: Record<string, any>) {
  throw new Error("Endpoint de generación automática no implementado en backend.");
}
