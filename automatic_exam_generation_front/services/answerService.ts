export async function getAnswers() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answer`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener las respuestas");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getAnswers:", error);
    throw error;
  }
}

export async function postAnswer(answer: { exam_id: number, question_id: number, student_id: number,answer_text: string }) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(answer),
    });
    if (!response.ok) {
      throw new Error("Error al crear la respuesta");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en postAnswer:", error);
    throw error;
  }
}

export async function getAnswerById(exam_id: number, question_id: number, student_id: number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answer/${exam_id}/${question_id}/${student_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Error al obtener la respuesta");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en getAnswerById:", error);
    throw error;
  }
}

export async function updateAnswer(exam_id: number, question_id: number, student_id: number, answer: { answer_text?: string; score?: number }) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answer/${exam_id}/${question_id}/${student_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(answer),
    });
    if (!response.ok) {
      throw new Error("Error al actualizar la respuesta");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en updateAnswer:", error);
    throw error;
  }
}

export async function deleteAnswer(exam_id: number, question_id: number, student_id: number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answer/${exam_id}/${question_id}/${student_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Error al eliminar la respuesta");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en deleteAnswer:", error);
    throw error;
  }
}