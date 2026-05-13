import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from './Toast'

export default function LoginPage() {
  const { login } = useAuth()
  const toast = useToast()

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
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813
                  a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12
                  l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">AskDocs</h1>
            <p className="text-sm text-gray-400 mt-1">Intelligent Document Assistant</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="text-lg font-semibold text-white">Welcome back</h2>
            <p className="text-sm text-gray-400">Sign in to access your documents</p>
          </div>

          {/* Privacy notice */}
          <div className="rounded-xl bg-violet-950/40 border border-violet-900/30 p-4 space-y-2">
            <p className="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
              <ShieldIcon /> Your documents stay private
            </p>
            <ul className="space-y-1.5">
              {[
                'Text is extracted entirely in your browser',
                'Only text chunks are sent to the server',
                'The original file never leaves your device',
              ].map((item) => (
                <li key={item} className="text-[11px] text-gray-400 flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Google Sign-In */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={login}
              onError={() => toast.error('Google sign-in failed. Please try again.')}
              theme="filled_black"
              shape="rectangular"
              size="large"
              text="signin_with_google"
              logo_alignment="left"
            />
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-600">
          By signing in you agree to our terms of service.
        </p>
      </div>
    </div>
  )
}

const ShieldIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6
        3.99 15.519 3.793 15a11.956 11.956 0 01-.196 2.067A11.99 11.99 0 0012 21
        11.99 11.99 0 0020.403 17.067 11.956 11.956 0 0120.207 15
        c-.196-4.519.457-8.907 2.202-11.036A11.959 11.959 0 0112 2.764z" />
  </svg>
)
