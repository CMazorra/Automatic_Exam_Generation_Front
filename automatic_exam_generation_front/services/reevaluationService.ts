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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reevaluation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
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
    throw error;
  }
}