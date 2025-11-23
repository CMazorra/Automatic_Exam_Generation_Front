export async function getParams() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parameters`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener las parametrizaciones");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getParams:", error);
    throw error;
  }
}

export async function postParams(params: { proportion: string , amount_quest: string, quest_topics: string}) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parameters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      throw new Error("Error al crear la parametrización");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en postParams:", error);
    throw error;
  }
}

export async function getParamsById(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parameters/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Error al obtener la parametrización");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en getParamsById:", error);
    throw error;
  }
}

export async function updateParams(id: string, params: { proportion: string , amount_quest: string, quest_topics: string}) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parameters/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      throw new Error("Error al actualizar la parametrización");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en updateParams:", error);
    throw error;
  }
}

export async function deleteParams(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parameters/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Error al eliminar la parametrización");
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error en deleteParams:", error);
    throw error;
  }
}