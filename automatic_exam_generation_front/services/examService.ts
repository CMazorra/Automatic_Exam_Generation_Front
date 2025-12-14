async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getExams() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exam`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    cache: "no-store",
  });
  return handleResponse(res);
}

export async function getExamById(id: string | number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exam/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    cache: "no-store",
  });
  return handleResponse(res);
}

export async function createExam(payload: Record<string, any>) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exam`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateExam(id: string | number, payload: Record<string, any>) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exam/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateExamStatus(examId: number | string, newStatus: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exam/${examId}`, {
      method: "PATCH", // O podría ser "PUT" dependiendo de tu API
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ status: newStatus }), // Solo enviamos el nuevo estado
    });
    if (!response.ok) {
      // Es crucial capturar errores aquí para no detener la asignación si falla el cambio de estado.
      console.error(`Error ${response.status} al actualizar el estado del examen ${examId}`);
      throw new Error("Error al actualizar el estado del examen");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en updateExamStatus:", error);
    throw error;
  }
}

export async function deleteExam(id: string | number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exam/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return handleResponse(res);
}

export async function generateExam(parameters: { exam_id: string | number , subject_id: number | string, teacher_id: number | string, head_teacher_id: number | string, questionDistribution: Array<{ type: string; amount: number }> }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exam/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(parameters),
  });
  return handleResponse(res);
}
