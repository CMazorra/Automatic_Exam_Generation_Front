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

export async function updateAnswer(exam_id: number, question_id: number, student_id: number, answer: { answer_text: string }) {
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

// src/services/answerService.ts (Añade esta función al final de tu archivo)

interface AnswerSubmission {
    exam_id: number;
    question_id: number;
    student_id: number;
    answer_text: string;
}

// -----------------------------------------------------
// Nueva función de utilidad para enviar todas las respuestas
// -----------------------------------------------------

/**
 * [UTILITY - Issue 1] Envía todas las respuestas llamando a postAnswer para cada una.
 */
export async function postStudentAnswers(answers: AnswerSubmission[]) {
    // Usamos Promise.all para enviar todas las respuestas en paralelo
    const submissionPromises = answers.map(answer => postAnswer(answer));
    
    // Esperamos a que todas las promesas se resuelvan. Si alguna falla, se lanza un error.
    return Promise.all(submissionPromises);
}

// -----------------------------------------------------
// [PLACEHOLDER - Issue 3] Servicio para solicitar recalificación
// -----------------------------------------------------

// src/services/answerService.ts (Actualización de la función)

// ... (Otras funciones) ...

// **NUEVA ESTRUCTURA**
export async function postRecalificationRequest(examId: number, studentId: number, teacherId: number) {
    
    // CORRECCIÓN CLAVE: La URL debe apuntar directamente a /reevaluation,
    // NO a una ruta anidada bajo /exams.
    const url = `${process.env.NEXT_PUBLIC_API_URL}/reevaluation`; 

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
            // Campos requeridos por CreateReevaluationDto:
            exam_id: examId,
            student_id: studentId, 
            teacher_id: teacherId, 
            score: 0 // Enviamos 0 como marcador de posición para "pendiente de revisión"
        }),
    });
    
    if (!res.ok) {
        const errorText = await res.text().catch(() => "Error desconocido");
        // La línea 164 es donde se lanza el error con el mensaje de backend
        throw new Error(`Error al solicitar recalificación: ${errorText}`);
    }
    return res.json();
}



