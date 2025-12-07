export async function getGeneratedExamsBySubject(subject_id: number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exam/generated/subject/${subject_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener los examenes generados por materia");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getGeneratedExamsBySubject:", error);
    throw error;
  }
}

export async function getMostUsedQuestions() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exam-question/most-used`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener las preguntas más usadas");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getMostUsedQuestions:", error);
    throw error;
  }
}

export async function listApprovedByHeadTeacher(head_teacher_id: number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/approved-exam/head-teacher/${head_teacher_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener los exámenes aprobados por el jefe de departamento");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en listApprovedByHeadTeacher:", error);
    throw error;
  }
}

export async function getPerformance(exam_id: number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exam/${exam_id}/performance`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener el rendimiento del examen");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getPerformance:", error);
    throw error;
  }
}

export async function getWorstQuestions() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/worst-questions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener las peores preguntas");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getWorstQuestions:", error);
    throw error;
  }
}

export async function getDifficultyPerformanceCorrelation() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/difficulty-performance-correlation`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener la correlación entre dificultad y rendimiento");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getDifficultyPerformanceCorrelation:", error);
    throw error;
  }
}

export async function getReevaluationComparison() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/reevaluation-comparison`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener la comparación de reevaluaciones");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getReevaluationComparison:", error);
    throw error;
  }
}

export async function getTeachersReview() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/teachers-review-report`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener el registro de profesores que revisan exámenes");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getTeachersReviewReport:", error);
    throw error;
  }
}