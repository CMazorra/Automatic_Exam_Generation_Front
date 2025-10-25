export async function login(email: string, password: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error("Credenciales incorrectas")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error en login:", error)
    throw error
  }
}