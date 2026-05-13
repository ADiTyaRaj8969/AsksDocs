import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

const AuthContext = createContext(null)

const SIGNIN_TIME_KEY = 'askdocs_signin_time'
const SESSION_DAYS = 10
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(() => {})

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const signedInAt = parseInt(localStorage.getItem(SIGNIN_TIME_KEY) || '0', 10)
        if (signedInAt && Date.now() - signedInAt > SESSION_MS) {
          // Session older than 10 days — force re-login
          await signOut(auth)
          localStorage.removeItem(SIGNIN_TIME_KEY)
          setUser(null)
        } else {
          if (!signedInAt) localStorage.setItem(SIGNIN_TIME_KEY, String(Date.now()))
          const token = await firebaseUser.getIdToken()
          setUser({ firebaseUser, token })
        }
      } else {
        localStorage.removeItem(SIGNIN_TIME_KEY)
        setUser(null)
      }
      setReady(true)
    })
    return unsubscribe
  }, [])

  const login = useCallback(async () => {
    await signInWithPopup(auth, googleProvider)
    localStorage.setItem(SIGNIN_TIME_KEY, String(Date.now()))
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
    localStorage.removeItem(SIGNIN_TIME_KEY)
  }, [])

  // Components call this before doing a protected action. Returns true if the
  // user is signed in (or just signed in now), false if they cancelled the popup.
  const requireLogin = useCallback(async () => {
    if (auth.currentUser) return true
    try {
      await login()
      return true
    } catch (err) {
      return false
    }
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
