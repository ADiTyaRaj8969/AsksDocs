import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { googleLogout } from '@react-oauth/google'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)   // { name, email, picture, token }
  const [ready, setReady] = useState(false)  // finished checking sessionStorage

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('askdocs_user')
      if (stored) setUser(JSON.parse(stored))
    } catch {
      sessionStorage.removeItem('askdocs_user')
    } finally {
      setReady(true)
    }
  }, [])

  const login = useCallback((credentialResponse) => {
    // Decode the JWT payload (no verification needed here — server verifies)
    const [, payloadB64] = credentialResponse.credential.split('.')
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))

    const userData = {
      name:    payload.name,
      email:   payload.email,
      picture: payload.picture,
      token:   credentialResponse.credential,
      exp:     payload.exp,
    }
    setUser(userData)
    sessionStorage.setItem('askdocs_user', JSON.stringify(userData))
  }, [])

  const logout = useCallback(() => {
    googleLogout()
    setUser(null)
    sessionStorage.removeItem('askdocs_user')
  }, [])

  // Auto-logout when the Google ID token expires (1 h)
  useEffect(() => {
    if (!user?.exp) return
    const ms = user.exp * 1000 - Date.now()
    if (ms <= 0) { logout(); return }
    const t = setTimeout(logout, ms)
    return () => clearTimeout(t)
  }, [user, logout])

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
