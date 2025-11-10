export async function login(account: string, password: string) {
  try {
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account, password }),
    })

    if (!response.ok) {
      const isJson = (response.headers.get("content-type") || "").includes("application/json")
      const errBody = isJson ? await response.json().catch(() => null) : await response.text().catch(() => null)
      const message = (errBody && (errBody.message || errBody.error)) || errBody || `HTTP ${response.status}`
      throw new Error(typeof message === "string" ? message : `HTTP ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error en login:", error)
    throw error
  }
}