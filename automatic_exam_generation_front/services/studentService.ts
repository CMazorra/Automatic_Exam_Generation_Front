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
      throw new Error("Error al obtener el estudiante");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getStudentByID:", error);
    throw error;
  }
}