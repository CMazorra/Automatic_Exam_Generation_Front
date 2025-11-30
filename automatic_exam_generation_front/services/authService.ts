export async function login(account: string, password: string) {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`
    console.log("API URL:", url)
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
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

export async function logout() {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `HTTP ${res.status}`)
  }
  if (typeof document !== "undefined") {
    document.cookie = "aeg_role=; Path=/; Max-Age=0; SameSite=Lax"
    document.cookie = "aeg_head=; Path=/; Max-Age=0; SameSite=Lax"
  }

  return true
}

export async function getCurrentUser() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store",
    })
    if (!response.ok) {
      const text = await response.text().catch(() => "")
      throw new Error(text || `HTTP ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error en getCurrentUser:", error)
    throw error
  }
}