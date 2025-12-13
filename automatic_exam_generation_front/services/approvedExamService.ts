export async function getApprovedExams() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/approved-exam`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener los exámenes aprobados");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getApprovedExams:", error);
    throw error;
  }
}

export async function postApprovedExam(approved_exam: { date_id: number, exam_id: number, head_teacher_id: number, guidelines: string }) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/approved-exam`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(approved_exam),
    });
    if (!response.ok) {
      throw new Error("Error al crear el examen aprobado");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en postQuestions:", error);
    throw error;
  }
}

export async function getApprovedExamsByHeadTeacherId(head_teacher_id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/approved-exam/${head_teacher_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Error al obtener los exámenes aprobados");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en getQuestionById:", error);
    throw error;
  }
}

export async function getApprovedExamById(date: Date, exam_id: string, head_teacher_id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/approved-exam/${date}/${exam_id}/${head_teacher_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Error al obtener el examen aprobado");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en getApprovedExamById:", error);
    throw error;
  }
}

export async function updateApprovedExam(date: Date, exam_id: string, head_teacher_id: string, approved_exam: { guidelines: string, seen?: boolean }) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/approved-exam/${date}/${exam_id}/${head_teacher_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(approved_exam),
    });
    if (!response.ok) {
      throw new Error("Error al actualizar el examen aprobado");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en updateQuestion:", error);
    throw error;
  }
}

export async function deleteApprovedExam(date: Date, exam_id: string, head_teacher_id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/approved-exam/${date}/${exam_id}/${head_teacher_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Error al eliminar el examen aprobado");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en deleteApprovedExam:", error);
    throw error;
  }
}