export async function getExams() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exams`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener los examenes");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getExams:", error);
    throw error;
  }
}
