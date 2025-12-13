export async function getStudents() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener los estudiantes");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getStudents:", error);
    throw error;
  }
}

export async function getStudentByID(id: number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/${id}`, {
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
        throw new Error(`Error al obtener los estudiantes (Estado: ${status}, Detalle: ${errorDetail})`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getStudentByID:", error);
    throw error;
  }
}

export async function postStudentSubject(id : number | string, subjectId: number | string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/${id}/subjects/${subjectId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({ id, subjectId }),
    });

    if (!response.ok) {
      throw new Error("Error al agregar la asignatura al estudiante");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en postStudentSubject:", error);
    throw error;
  }
}