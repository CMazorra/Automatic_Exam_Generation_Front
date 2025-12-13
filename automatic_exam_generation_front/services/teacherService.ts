
// src/services/teacherService.ts

interface Teacher {
    id: number;
    name: string;
}

interface Subject {
    id: number;
    name: string;
}

interface TeacherWithSubjects {
    id: number;
    name: string;
    subjects: Subject[]; // Añadimos las asignaturas
}
export async function getTeachers() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teacher`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
        // AÑADIDO: Capturamos el estado HTTP y el mensaje del servidor
        const status = response.status;
        const errorDetail = await response.text().catch(() => "Mensaje no disponible");
        throw new Error(`Error al obtener los profesores (Estado: ${status}, Detalle: ${errorDetail})`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getTeachers:", error);
    throw error;
  }
}

export async function getTeacherByID(id: number | string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teacher/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
        // AÑADIDO: Capturamos el estado HTTP y el mensaje del servidor
        const status = response.status;
        const errorDetail = await response.text().catch(() => "Mensaje no disponible");
        throw new Error(`Error al obtener el profesor (Estado: ${status}, Detalle: ${errorDetail})`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getTeacherByID:", error);
    throw error;
  }
}


export async function updateTeacher(
  id: number | string,
  patch: Partial<{ isHeadTeacher: boolean }> = { isHeadTeacher: true }
) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teacher/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify(patch),
    });

    if (!response.ok) {
      throw new Error("Error al modificar profesor");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en updateTeacher:", error);
    throw error;
  }
}

/**
 * ⚡ UTILITY: Obtiene todos los profesores y las asignaturas que imparte cada uno.
 * Hace llamadas paralelas para ser más eficiente que hacerlas secuencialmente (N+1 problema).
 */
export async function getTeachersWithSubjects(): Promise<TeacherWithSubjects[]> {
    const teachers: Teacher[] = await getTeachers(); // Obtenemos la lista base de profesores

    const teachersWithSubjectsPromises = teachers.map(async (teacher) => {
        // Obtenemos las asignaturas para este profesor específico
        const subjects: any[] = await getSubjectsFlatByTeacherID(teacher.id);

        return {
            id: teacher.id,
            name: (teacher as any).user?.name || teacher.name || "Profesor sin nombre", // Intentamos obtener el nombre
            subjects: subjects.map(s => ({ id: Number(s.id), name: s.name })),
        } as TeacherWithSubjects;
    });

    // Esperamos a que todas las promesas se resuelvan en paralelo
    return Promise.all(teachersWithSubjectsPromises);
}



// SIMULACIÓN: En un sistema real, esto llamaría a un endpoint /teachers
export async function getReviewTeachers(): Promise<Teacher[]> {
    // En el futuro, podrías filtrar profesores por asignatura o nivel.
    // Por ahora, simulamos una lista fija:
    return [
        { id: 101, name: "Prof. Ana García (Matemáticas)" },
        { id: 102, name: "Prof. Luis Pérez (Ingeniería)" },
        { id: 103, name: "Prof. Elena Soto (Ciencias)" },
    ];
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