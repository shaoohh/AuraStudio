import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Mail, Shield } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { useAuthSessionQuery, useSignInMutation, useSignUpMutation } from '../api'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const sessionQuery = useAuthSessionQuery()
  const signInMutation = useSignInMutation()
  const signUpMutation = useSignUpMutation()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const helperText = useMemo(
    () => (mode === 'signin' ? '登录后直接进入你的工作台。' : '注册后会自动为你创建 Aura Studio 账户。'),
    [mode]
  )

  const isPending = signInMutation.isPending || signUpMutation.isPending
  const errorMessage =
    (signInMutation.error as Error | null)?.message || (signUpMutation.error as Error | null)?.message || ''

  useEffect(() => {
    if (!sessionQuery.data) return

    const nextPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/writing'
    navigate(nextPath, { replace: true })
  }, [location.state, navigate, sessionQuery.data])

  if (sessionQuery.data) {
    return <Navigate to="/writing" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030712] px-6">
      <div className="w-full max-w-[460px] rounded-[28px] border border-[#243137] bg-[#07182E] p-8 shadow-[0_0_50px_rgba(0,0,0,0.45)]">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#bd9f67]/30 bg-[#243137] shadow-[0_0_20px_rgba(189,159,103,0.15)]">
            <span className="border-b-[3px] border-[#bd9f67] pb-[2px] text-2xl font-black leading-[0.8] tracking-wide text-[#bd9f67]">AS</span>
          </div>
          <h1 className="text-[28px] font-black tracking-wide text-slate-50">Aura Studio</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">{helperText}</p>
        </div>

        <div className="mb-6 flex rounded-full border border-[#243137] bg-[#0d2039] p-1">
          <button
            onClick={() => {
              setMode('signin')
              setSuccessMessage('')
            }}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              mode === 'signin' ? 'bg-[#45f3ff] text-[#07182E]' : 'text-slate-400'
            }`}
          >
            登录
          </button>
          <button
            onClick={() => {
              setMode('signup')
              setSuccessMessage('')
            }}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              mode === 'signup' ? 'bg-[#45f3ff] text-[#07182E]' : 'text-slate-400'
            }`}
          >
            注册
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <Mail className="h-3.5 w-3.5" />
              Email
            </span>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="hello@aura-studio.com"
              className="h-12 rounded-xl border-[#243137] bg-[#0b1b31] px-4 text-slate-100 placeholder:text-slate-500 focus-visible:border-[#45f3ff] focus-visible:ring-[#45f3ff]/20"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <Shield className="h-3.5 w-3.5" />
              Password
            </span>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="输入密码"
              className="h-12 rounded-xl border-[#243137] bg-[#0b1b31] px-4 text-slate-100 placeholder:text-slate-500 focus-visible:border-[#45f3ff] focus-visible:ring-[#45f3ff]/20"
            />
          </label>
        </div>

        {errorMessage ? <div className="mt-4 text-sm text-red-400">{errorMessage}</div> : null}
        {successMessage ? <div className="mt-4 text-sm text-emerald-400">{successMessage}</div> : null}

        <Button
          className="mt-6 h-12 w-full rounded-full bg-[#45f3ff] text-sm font-bold text-[#07182E] hover:bg-[#7df7ff]"
          disabled={isPending || !email.trim() || !password.trim()}
          onClick={async () => {
            setSuccessMessage('')

            if (mode === 'signin') {
              signInMutation.mutate({ email: email.trim(), password })
              return
            }

            const session = await signUpMutation.mutateAsync({ email: email.trim(), password })
            if (!session) {
              setSuccessMessage('注册成功，请检查邮箱中的确认邮件。')
            }
          }}
        >
          {isPending ? '提交中...' : mode === 'signin' ? '进入工作台' : '创建账户'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// 登录页，接入真实 Supabase 登录与注册。
