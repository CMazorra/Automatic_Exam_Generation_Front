import { getTeacherById } from '@/services/userService';
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
      throw new Error("Error al obtener los profesores");
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
      throw new Error("Error al obtener el profesor");
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

export async function getTeachersBySubjectID(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teacher/subjects/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener los profesores de la asignatura");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getTeachersBySubjectID:", error);
    throw error;
  }
}