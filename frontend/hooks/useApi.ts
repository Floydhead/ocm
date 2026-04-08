const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const getAuthToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

const request = async (url, options: any = {}) => {
  const headers = {
    ...(options.headers || {}),
  }

  const token = getAuthToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(apiUrl + url, {
    credentials: 'include',
    ...options,
    headers,
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || res.statusText)
  }

  return res.json()
}

const buildRequest = (url, method, body, headers = {}) => {
  let requestBody = body
  const requestHeaders = { ...headers }

  if (body && !(body instanceof FormData) && typeof body === 'object') {
    requestBody = JSON.stringify(body)
    requestHeaders['Content-Type'] = 'application/json'
  }

  return request(url, { method, body: requestBody, headers: requestHeaders })
}

export const useApi = {
  get: async (url) => request(url, { method: 'GET' }),
  post: async (url, body, headers = {}) => buildRequest(url, 'POST', body, headers),
  patch: async (url, body, headers = {}) => buildRequest(url, 'PATCH', body, headers),
  put: async (url, body, headers = {}) => buildRequest(url, 'PUT', body, headers),
  delete: async (url, headers = {}) => request(url, { method: 'DELETE', headers }),
}