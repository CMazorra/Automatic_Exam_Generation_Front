export async function getQuestions() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener las preguntas");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getQuestions:", error);
    throw error;
  }
}

export async function postQuestion(question: { question_text: string , difficulty: string, answer: string, type: string, score:number,
  subject_id: string, sub_topic_id: string, topic_id: string, teacher_id: string
}) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(question),
    });
    if (!response.ok) {
      alert(response.statusText);
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en postQuestions:", error);
    throw error;
  }
}

export async function getQuestionById(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Error al obtener la pregunta");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en getQuestionById:", error);
    throw error;
  }
}

export async function updateQuestion(id: string, question: { question_text: string , difficulty: string, answer: string, type: string,
  subject_id: string, sub_topic_id: string, topic_id: string, teacher_id: string
}) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(question),
    });
    if (!response.ok) {
      throw new Error("Error al actualizar la pregunta");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en updateQuestion:", error);
    throw error;
  }
}

export async function deleteQuestion(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Error al eliminar la pregunta");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en deleteQuestion:", error);
    throw error;
  }
}