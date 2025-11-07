export async function getQuestions() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener las preguntas");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getQuestions:", error);
    throw error;
  }
}
