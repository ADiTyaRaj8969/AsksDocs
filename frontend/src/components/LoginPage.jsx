import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from './Toast'

export default function LoginPage() {
  const { login } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      await login()
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Sign-in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600
            flex items-center justify-center shadow-2xl shadow-violet-900/50">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor"
              strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12
                  l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09
                  3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">AskDocs</h1>
            <p className="text-sm text-gray-400 mt-1">Intelligent Document Assistant</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold text-white">Welcome</h2>
            <p className="text-sm text-gray-400">Sign in to access your documents</p>
          </div>

          {/* Privacy notice */}
          <div className="rounded-xl bg-violet-950/40 border border-violet-900/30 p-4 space-y-2">
            <p className="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
              <ShieldIcon /> Your documents stay private
            </p>
            <ul className="space-y-1.5">
              {[
                'Text extracted entirely in your browser',
                'Original file never leaves your device',
                'Only text chunks sent to server for AI',
              ].map((item) => (
                <li key={item} className="text-[11px] text-gray-400 flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Google Sign-In button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
              bg-white hover:bg-gray-100 disabled:opacity-60 disabled:pointer-events-none
              text-gray-800 font-medium text-sm transition-all duration-150 active:scale-[0.98]
              shadow-lg shadow-black/30"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-gray-400 border-t-gray-800
                rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {loading ? 'Signing in…' : 'Continue with Google'}
          </button>
        </div>

        <p className="text-center text-[11px] text-gray-600">
          By signing in you agree to our terms of service.
        </p>
      </div>
    </div>
  )
}

const ShieldIcon = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor"
    strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 3.99 15.519
        3.793 15a11.956 11.956 0 01-.196 2.067A11.99 11.99 0 0012 21a11.99 11.99 0
        0020.403-17.067 11.956 11.956 0 01-.196-2.067A11.959 11.959 0 0112 2.764z" />
  </svg>
)

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)
