export async function getUsers() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Error al obtener usuarios")
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error en getUsers:", error)
    throw error
  }
}

export async function getUserById(id: string | number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })
    if (!response.ok) throw new Error("Error al obtener usuario")
    return await response.json()
  } catch (error) {
    console.error("Error en getUserById:", error)
    throw error
  }
}

export async function createUser(data: {
  name: string;
  password: string;
  account: string;
  age: number;
  course: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
}) {
  try {
    // Ensure role is uppercase to match backend enum
    const payload = {
      ...data,
      role: data.role.toUpperCase() as 'ADMIN' | 'TEACHER' | 'STUDENT'
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Error al crear usuario")
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error en createUser:", error)
    throw error
  }
}

export async function updateUser(id: string | number, data: Partial<{
  name: string;
  password: string;
  account: string;
  age: number;
  course: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
}>) {
  try {
    // Ensure role is uppercase to match backend enum
    const payload = data.role ? { 
      ...data, 
      role: data.role.toUpperCase() as 'ADMIN' | 'TEACHER' | 'STUDENT' 
    } : data

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Error al actualizar usuario")
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error en updateUser:", error)
    throw error
  }
}

export async function deleteUser(id: string | number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Error al eliminar usuario")
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error en deleteUser:", error)
    throw error
  }
}