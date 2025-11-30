export async function getSubtopics() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subtopics`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener los subtemas");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getSubtopics:", error);
    throw error;
  }
}

export async function postSubtopic(subtopic: { name: string }) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subtopics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(subtopic),
    });
    if (!response.ok) {
      throw new Error("Error al crear el subtema");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en postSubtopic:", error);
    throw error;
  }
}

export async function getSubtopicById(id: string , topic_id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subtopics/${id}/${topic_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Error al obtener el subtema");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en getSubtopicById:", error);
    throw error;
  }
}

export async function updateSubtopic(id: string, topic_id: string, subtopic: { name: string }) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subtopics/${id}/${topic_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(subtopic),
    });
    if (!response.ok) {
      throw new Error("Error al actualizar el subtema");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en updateSubtopic:", error);
    throw error;
  }
}

export async function deleteSubtopic(id: string, topic_id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subtopics/${id}/${topic_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Error al eliminar el subtema");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en deleteSubtopic:", error);
    throw error;
  }
}
