export async function getExamStudents() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exam-student`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener los examenes de estudiantes");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getExamStudents:", error);
    throw error;
  }
}

export async function postExamStudent(examStudent: { exam_id: number, student_id: number, teacher_id: number, score: number }) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exam-student`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(examStudent),
    });
    if (!response.ok) {
      throw new Error("Error al crear el examen del estudiante");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en postQuestions:", error);
    throw error;
  }
}

export async function getExamStudentById(exam_id: number, student_id: number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exam-student/${exam_id}/${student_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Error al obtener el examen del estudiante");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en getExamStudentById:", error);
    throw error;
  }
}

export async function updateExamStudent(exam_id: number, student_id: number, examStudent: { score: number }) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exam-student/${exam_id}/${student_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(examStudent),
    });
    if (!response.ok) {
      throw new Error("Error al actualizar el examen del estudiante");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en updateExamStudent:", error);
    throw error;
  }
}

export async function deleteExamStudent(exam_id: number, student_id: number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exam-student/${exam_id}/${student_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Error al eliminar el examen del estudiante");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en deleteExamStudent:", error);
    throw error;
  }
}