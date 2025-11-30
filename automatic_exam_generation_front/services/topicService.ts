export async function getTopics() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/topics`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener los temas");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getTopics:", error);
    throw error;
  }
}

export async function postTopic(subtopic: { name: string }) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/topics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(subtopic),
    });
    if (!response.ok) {
      throw new Error("Error al crear el tema");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en postTopic:", error);
    throw error;
  }
}

export async function getTopicById(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/topics/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Error al obtener el tema");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en getTopicById:", error);
    throw error;
  }
}

export async function getTopicsBySubjectId(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/topics/subject/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Error al obtener el tema");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en getTopicById:", error);
    throw error;
  }
}

export async function updateTopic(id: string, topic: { name: string }) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/topics/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(topic),
    });
    if (!response.ok) {
      throw new Error("Error al actualizar el tema");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en updateTopic:", error);
    throw error;
  }
}

export async function deleteTopic(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/topics/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Error al eliminar el tema");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en deleteTopic:", error);
    throw error;
  }
}

export async function updateTopic_Subject(id: string, subject_id: string | number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/topics/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ subject_id: Number(subject_id) }),
    })
    if (!response.ok) {
      const raw = await response.text().catch(() => "")
      throw new Error(raw || "Error al actualizar el tema")
    }
    return await response.json()
  } catch (error) {
    console.error("Error en updateTopic_Subject:", error)
    throw error
  }
}