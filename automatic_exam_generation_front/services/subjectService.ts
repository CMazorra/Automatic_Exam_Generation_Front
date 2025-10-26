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
