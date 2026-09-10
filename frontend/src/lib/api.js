const BASE = import.meta.env.VITE_API_BASE || '/api'
const TOKEN_KEY = 'dfe_admin_token'

function read(key) {
  try {
    return localStorage.getItem(key) || ''
  } catch {
    return ''
  }
}

function write(key, value) {
  try {
    if (value) localStorage.setItem(key, value)
    else localStorage.removeItem(key)
  } catch {
    /* storage unavailable — the session lives for this page only */
  }
}

export const getToken = () => read(TOKEN_KEY)
export const setToken = (token) => write(TOKEN_KEY, token)

export class ApiError extends Error {
  constructor(message, { status = 0, fields = null } = {}) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

async function request(path, { method = 'GET', body, auth = false, raw = false } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(
      'We could not reach the server. Check your internet connection and try again.',
      { status: 0 },
    )
  }

  if (res.status === 401 && auth) {
    setToken('')
    throw new ApiError('Your session has ended. Please sign in again.', { status: 401 })
  }

  if (!res.ok) {
    let detail = `Something went wrong (${res.status}).`
    let fields = null
    try {
      const data = await res.json()
      if (data?.detail) detail = typeof data.detail === 'string' ? data.detail : detail
      if (data?.fields) fields = data.fields
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(detail, { status: res.status, fields })
  }

  if (raw) return res
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  meta: () => request('/meta'),
  submitFaculty: (payload) => request('/responses/faculty', { method: 'POST', body: payload }),
  submitStudent: (payload) => request('/responses/student', { method: 'POST', body: payload }),

  login: (username, password) => request('/admin/login', { method: 'POST', body: { username, password } }),
  session: () => request('/admin/session', { auth: true }),
  overview: () => request('/admin/overview', { auth: true }),
  analytics: (type) => request(`/admin/analytics?respondent_type=${type}`, { auth: true }),
  responses: (params) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/admin/responses?${qs}`, { auth: true })
  },
  deleteResponse: (id) => request(`/admin/responses/${id}`, { method: 'DELETE', auth: true }),
  exportFile: async (type) => {
    const res = await request(`/admin/export?respondent_type=${type}`, { auth: true, raw: true })
    const blob = await res.blob()
    const disposition = res.headers.get('Content-Disposition') || ''
    const match = disposition.match(/filename="?([^"]+)"?/)
    return { blob, filename: match ? match[1] : `responses-${type}.xlsx` }
  },
}
