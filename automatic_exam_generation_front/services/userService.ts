export async function getUsers() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener los usuarios");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getUsers:", error);
    throw error;
  }
}

export async function getTeachers() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teachers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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

export async function getStudents() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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