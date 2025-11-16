export async function getSubjects() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subjects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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