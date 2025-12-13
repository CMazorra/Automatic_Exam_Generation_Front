export async function getSubjects() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subjects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener las asignaturas");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getSubjects:", error);
    throw error;
  }
}

export async function getSubjectById(id: number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subjects/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener las asignaturas");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getSubjects:", error);
    throw error;
  }
}

export async function postSubject(subject: {
  name: string
  program?: string
  head_teacher_id: number | string
}) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subjects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(subject),
    });

    if (!response.ok) {
      throw new Error("Error al crear la asignatura");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en postSubject:", error);
    throw error;
  }
}

export async function updateSubject(id: number, subject: { name?: string; program?: string; head_teacher_id: number | string}) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subjects/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(subject),
    });

    if (!response.ok) {
      throw new Error("Error al actualizar la asignatura");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en updateSubject:", error);
    throw error;
  }
}

export async function deleteSubject(id: number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subjects/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al eliminar la asignatura");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en deleteSubject:", error);
    throw error;
  }
}

export async function getSubjectsByTeacherID(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teacher/${id}/subjects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Error ${response.status}: ${text}`)
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en getSubjectsByTeacherID:", error);
    throw error;
  }
}

// Tipos locales para la estructura de asignaturas
type Subject = {
  id: number
  name: string
  head_teacher_id: number
  program?: string
}

type SubjectsByRoleResponse = {
  subjectsAsTeacher?: Subject[]
  subjectsAsHead?: Subject[]
}

/**
 * Convierte la nueva respuesta (con roles) a la forma antigua
 * unificando y eliminando duplicados por `id`.
 * Si ya viene como array (forma antigua), la devuelve tal cual.
 */
export function flattenSubjects(response: SubjectsByRoleResponse | Subject[]): Subject[] {
  if (Array.isArray(response)) {
    return response
  }
  const teacher = response?.subjectsAsTeacher ?? []
  const head = response?.subjectsAsHead ?? []
  const merged = [...teacher, ...head]
  const seen = new Set<number>()
  return merged.filter(s => {
    if (seen.has(s.id)) return false
    seen.add(s.id)
    return true
  })
}

/**
 * Nueva función que obtiene las asignaturas por ID de profesor
 * y devuelve el listado plano (forma antigua), incluyendo también
 * las asignaturas donde es Jefe de Departamento.
 */
export async function getSubjectsFlatByTeacherID(id: string): Promise<Subject[]> {
  const raw = await getSubjectsByTeacherID(id)
  return flattenSubjects(raw)
}

export async function getSubjectsByStudentID(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/${id}/subjects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Error ${response.status}: ${text}`)
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en getSubjectsByStudentID:", error);
    throw error;
  }
}