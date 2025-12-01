export async function getHeadTeachers() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/head-teacher`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener los jefes de asignatura");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getHeadTeachers:", error);
    throw error;
  }
}

export async function getHeadTeacherByID(id: number | string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/head-teacher/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener el jefe de asignatura");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getHeadTeacherByID:", error);
    throw error;
  }
}

export async function postHeadTeacher(id: number | string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/head-teacher`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({id}),
    });

    if (!response.ok) {
      throw new Error("Error al crear/promocionar el jefe de asignatura");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en postHeadTeacher:", error);
    throw error;
  }
}

export async function deleteHeadTeacher(id: number | string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/head-teacher`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({id}),
    });

    if (!response.ok) {
      throw new Error("Error al eliminar el jefe de asignatura");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en deleteHeadTeacher:", error);
    throw error;
  }
}