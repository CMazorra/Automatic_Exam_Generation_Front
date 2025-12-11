
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
        const subjects: any[] = await getSubjectsByTeacherID(teacher.id);

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


export async function getSubjectsByTeacherID(id: number | string): Promise<any[]> {
    try {
        // La URL que mencionaste: /teacher/[id]/subjects
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teacher/${id}/subjects`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            cache: "no-store",
        });

        if (!response.ok) {
            const status = response.status;
            const errorDetail = await response.text().catch(() => "Mensaje no disponible");
            // Lanzamos un error más informativo en caso de 403 o 404
            throw new Error(`Error ${status} al obtener asignaturas del profesor ${id}. Detalle: ${errorDetail}`);
        }

        const data = await response.json();
        // Asumimos que el backend devuelve un array de asignaturas (ej: [{id: 1, name: "Historia"}, ...])
        return Array.isArray(data) ? data : []; 
    } catch (error) {
        console.error(`Error en getSubjectsByTeacherID para ID ${id}:`, error);
        // Si el error ocurre, devolvemos un array vacío para que el flujo principal pueda continuar.
        return []; 
    }
}