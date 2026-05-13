import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? { firebaseUser } : null)
      setReady(true)
    })
    return unsubscribe
  }, [])

  const login = useCallback(async () => {
    await signInWithPopup(auth, googleProvider)
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])

  const requireLogin = useCallback(async () => {
    if (auth.currentUser) return true
    try { await login(); return true }
    catch { return false }
  }, [login])

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, requireLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
