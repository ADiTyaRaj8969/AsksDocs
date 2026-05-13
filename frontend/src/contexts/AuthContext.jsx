import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)   // Firebase User object + idToken
  const [ready, setReady] = useState(false)  // true once Firebase has resolved the session

  useEffect(() => {
    // onAuthStateChanged fires immediately with the persisted session (or null)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken()
        setUser({ firebaseUser, token })
      } else {
        setUser(null)
      }
      setReady(true)
    })
    return unsubscribe
  }, [])

  // Refresh the ID token before it expires (Firebase tokens last 1 h)
  // onAuthStateChanged handles re-auth automatically; we also refresh on demand.
  const getToken = useCallback(async () => {
    if (!auth.currentUser) return null
    return auth.currentUser.getIdToken(/* forceRefresh */ false)
  }, [])

  const login = useCallback(async () => {
    await signInWithPopup(auth, googleProvider)
    // onAuthStateChanged will update `user` automatically
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
