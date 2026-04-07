const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const useApi = {
  get: async (url) => {
    const res = await fetch(apiUrl + url, { credentials: "include" })
    if (!res.ok) throw new Error(res.statusText)
    return res.json()
  },
  post: async (url, body) => {
    const res = await fetch(apiUrl + url, {
      method: "POST",
      body,
      credentials: "include",
    })
    if (!res.ok) throw new Error(res.statusText)
    return res.json()
  },
  // … patch, delete wrappers
}