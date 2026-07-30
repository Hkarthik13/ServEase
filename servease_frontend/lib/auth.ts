export type StoredUser = {
  id?: number
  email?: string
  first_name?: string
  last_name?: string
  role?: string
  full_name?: string
  phone?: string
}

export function getStoredAuth() {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null, user: null as StoredUser | null }
  }

  const accessToken = window.localStorage.getItem('access_token')
  const refreshToken = window.localStorage.getItem('refresh_token')
  const rawUser = window.localStorage.getItem('user')

  return {
    accessToken,
    refreshToken,
    user: rawUser ? (JSON.parse(rawUser) as StoredUser) : null,
  }
}

export function setStoredAuth(accessToken: string, refreshToken: string, user: StoredUser) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem('access_token', accessToken)
  window.localStorage.setItem('refresh_token', refreshToken)
  window.localStorage.setItem('user', JSON.stringify(user))
}

export function clearStoredAuth() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem('access_token')
  window.localStorage.removeItem('refresh_token')
  window.localStorage.removeItem('user')
}

export function isAuthenticated() {
  return Boolean(getStoredAuth().accessToken)
}
